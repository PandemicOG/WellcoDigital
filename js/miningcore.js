var WebURL = window.location.protocol + "//" + window.location.hostname;  // Website URL (auto-detected)
var API = "https://api.wellcodigital.com/api/";                    // Fixed API endpoint
var stratumAddress = "stratum.wellcodigital.com";                          // Fixed stratum address

// Ensure API URL ends with slash
if (!API.endsWith('/')) {
    API = API + '/';
}

// Log configuration
console.log('MiningCore.WebUI URL : ', WebURL);
console.log('API Endpoint        : ', API);
console.log('Stratum Address     : ', "stratum+tcp://" + stratumAddress);
console.log('Current Page        : ', window.location.href);

// Initialize default page
currentPage = "index";
console.log('MiningCore.WebUI : ', WebURL);
console.log('API address used : ', API);
console.log('Stratum address  : ', "stratum+tcp://" + stratumAddress + ":");
console.log('Page Load        : ', window.location.href);

currentPage = "index"

// check browser compatibility
var nua = navigator.userAgent;
var is_IE = ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Trident') > -1) && !(nua.indexOf('Chrome') > -1));
if(is_IE) {
  console.log('Running in IE browser is not supported - ', nua);
}

// Load INDEX Page content
function loadIndex() {
  $("div[class^='page-").hide();
  
  $(".page").hide();
  $(".page-wrapper").show();
  $(".page-footer").show();
  
  var hashList = window.location.hash.split(/[#/?=]/);
  currentPool    = hashList[1];
  currentPage    = hashList[2];
  currentAddress = hashList[3];
  
  if (currentPool && !currentPage) {
    currentPage ="stats"
  } else if(!currentPool && !currentPage) {
    currentPage ="index";
  }
  
  if (currentPool && currentPage) {
    loadNavigation();
    $(".main-index").hide();
  $(".main-pool").show();
  $(".page-" + currentPage).show();
  $(".main-sidebar").show();
  } else {
    $(".main-index").show();
  $(".main-pool").hide();
  $(".page-index").show();
    $(".main-sidebar").hide();
  }
  
  if (currentPool) {
  $("li[class^='nav-']").removeClass("active");
    
  switch (currentPage) {
      case "stats":
      $(".nav-stats").addClass("active");
        loadStatsPage();
        break;
      case "dashboard":
        $(".nav-dashboard").addClass("active");
    loadDashboardPage();
        break;
    case "miners":
        $(".nav-miners").addClass("active");
    loadMinersPage();
        break;
      case "blocks":
      $(".nav-blocks").addClass("active");
        loadBlocksPage();
        break;
      case "payments":
      $(".nav-payments").addClass("active");
        loadPaymentsPage();
        break;
      case "connect":
        $(".nav-connect").addClass("active");
    loadConnectPage();
        break;
    case "faq":
        $(".nav-faq").addClass("active");
        break;
      case "support":
        $(".nav-support").addClass("active");
        break;
    }
  } else {
    loadHomePage();
  }
  scrollPageTop();
}

// Load HOME page content
function loadHomePage() {
  return $.ajax(API + "pools")
    .done(function(data) {
      const poolCoinCardTemplate = $(".index-coin-card-template").html();
    var poolCoinTableTemplate = "";
    
      $.each(data.pools, function(index, value) {
        var coinLogo = "<img class='coinimg' src='img/coin/icon/" + value.coin.type.toLowerCase() + ".png' />";
    var coinName = value.coin.name;
    if (typeof coinName === "undefined" || coinName === null) {coinName = value.coin.type;} 
        
        // SAFETY CHECK: Handle undefined poolStats/networkStats during sync
        const connectedMiners = value.poolStats ? value.poolStats.connectedMiners : 0;
        const poolHashrate = value.poolStats ? value.poolStats.poolHashrate : 0;
        const networkHashrate = value.networkStats ? value.networkStats.networkHashrate : 0;
        const networkDifficulty = value.networkStats ? value.networkStats.networkDifficulty : 0;
            
    poolCoinTableTemplate += "<tr class='coin-table-row' href='#" + value.id + "'>";
    poolCoinTableTemplate += "<td class='coin'><a href='#" + value.id + "'<span>" + coinLogo + coinName + " (" + value.coin.type.toUpperCase() + ") </span></a></td>";
    poolCoinTableTemplate += "<td class='algo'>" + value.coin.algorithm + "</td>";
    poolCoinTableTemplate += "<td class='miners'>" + connectedMiners + "</td>";
    poolCoinTableTemplate += "<td class='pool-hash'>" + _formatter(poolHashrate, 5, "H/s") + "</td>";
      poolCoinTableTemplate += "<td class='blocks'>" + value.totalBlocks + "</td>";
      poolCoinTableTemplate += "<td class='paid'>" + value.totalPaid + "</td>";
    poolCoinTableTemplate += "<td class='payout-type'>" + value.paymentProcessing.payoutScheme + "</td>"
    poolCoinTableTemplate += "<td class='fee'>" + value.poolFeePercent + " %</td>";
    poolCoinTableTemplate += "<td class='net-hash'>" + _formatter(networkHashrate, 5, "H/s") + "</td>";
    poolCoinTableTemplate += "<td class='net-diff'>" + _formatter(networkDifficulty, 5, "") + "</td>";
    poolCoinTableTemplate += "<td class='card-btn col-hide'>Go Mine " + coinLogo + coinName + "</td>";
    poolCoinTableTemplate += "</tr>";
      });

      $(".pool-coin-table").html(poolCoinTableTemplate);
    
    $(document).ready(function() {
        $('#pool-coins tr').click(function() {
          var href = $(this).find("a").attr("href");
          if(href) {
            window.location = href;
          }
        });
      });
    })
    .fail(function() {
      var poolCoinTableTemplate = "<tr><td colspan='8'><div class='alert alert-warning'>" +
        "<h4><i class='fas fa-exclamation-triangle'></i> Warning!</h4><hr>" +
        "<p>The pool is currently down for maintenance.</p><p>Please try again later.</p>" +
        "</div></td></tr>";
      $(".pool-coin-table").html(poolCoinTableTemplate);
    });
}

// Load STATS page content
function loadStatsPage() {
  setInterval(
    (function load() {
      loadStatsData();
      return load;
    })(),
    60000
  );
  setInterval(
    (function load() {
      loadStatsChart();
      return load;
    })(),
    600000
  );
}

// Load DASHBOARD page content
function loadDashboardPage() {
  function render() {
    setInterval(
      (function load() {
        loadDashboardData($("#walletAddress").val());
        loadDashboardWorkerList($("#walletAddress").val());
        loadDashboardChart($("#walletAddress").val());
        return load;
      })(),
      60000
    );
  }
  
  var walletQueryString = window.location.hash.split(/[#/?]/)[3];
  if (walletQueryString) {
    var wallet = walletQueryString.replace("address=", "");
    if (wallet) {
      $("#walletAddress").val(wallet);
      localStorage.setItem(currentPool + "-walletAddress", wallet);
      render();
    }
  }
  
  if (localStorage[currentPool + "-walletAddress"]) {
    $("#walletAddress").val(localStorage[currentPool + "-walletAddress"]);
  }
}

// Load MINERS page content
function loadMinersPage() {
  return $.ajax(API + "pools/" + currentPool + "/miners?page=0&pagesize=20")
    .done(function(data) {
      var minerList = "";
      if (data.length > 0) {
        $.each(data, function(index, value) {
          minerList += "<tr>";
          minerList +=   '<td>' + value.miner.substring(0, 12) + ' &hellip; ' + value.miner.substring(value.miner.length - 12) + '</td>';
          minerList += "<td>" + _formatter(value.hashrate, 5, "H/s") + "</td>";
          minerList += "<td>" + _formatter(value.sharesPerSecond, 5, "S/s") + "</td>";
          minerList += "</tr>";
        });
      } else {
        minerList += '<tr><td colspan="4">No miner connected</td></tr>';
      }
      $("#minerList").html(minerList);
    })
    .fail(function() {
      $.notify({ message: "Error: No response from API.<br>(loadMinersList)" }, { type: "danger", timer: 3000 });
    });
}

// Load BLOCKS page content
function loadBlocksPage() {
  return $.ajax(API + "pools/" + currentPool + "/blocks?page=0&pageSize=100")
    .done(function(data) {
      var blockList = "";
      if (data.length > 0) {
        $.each(data, function(index, value) {
      var createDate = convertLocalDateToUTCDate(new Date(value.created),false);
          var effort = Math.round(value.effort * 100);
          var effortClass = "";
          if (effort < 30) effortClass = "effort1";
          else if (effort < 80) effortClass = "effort2";
          else if (effort < 110) effortClass = "effort3";
          else effortClass = "effort4";

          blockList += "<tr>";
          blockList += "<td>" + createDate + "</td>";
          blockList += "<td><a href='" + value.infoLink + "' target='_blank'>" + value.blockHeight + "</a></td>";
          if (typeof value.effort !== "undefined") {
            blockList += "<td class='" + effortClass + "'>" + effort + "%</td>";
          } else {
            blockList += "<td>n/a</td>";
          }
          blockList += "<td>" + value.status + "</td>";
          blockList += "<td>" + _formatter(value.reward, 5, "") + "</td>";
          blockList += "<td><div class='c100 small p" + Math.round(value.confirmationProgress * 100) + "'><span>" + Math.round(value.confirmationProgress * 100) + "%</span><div class='slice'><div class='bar'></div><div class='fill'></div></div></div></td>";
          blockList += "</tr>";
        });
      } else {
        blockList += '<tr><td colspan="6">No blocks found yet</td></tr>';
      }
      $("#blockList").html(blockList);
    })
    .fail(function() {
      $.notify({ message: "Error: No response from API.<br>(loadBlocksList)" }, { type: "danger", timer: 3000 });
    });
}

// Load PAYMENTS page content
function loadPaymentsPage() {
  return $.ajax(API + "pools/" + currentPool + "/payments?page=0&pageSize=500")
    .done(function(data) {
      var paymentList = "";
      if (data.length > 0) {
        $.each(data, function(index, value) {
          var createDate = convertLocalDateToUTCDate(new Date(value.created),false);
          paymentList += '<tr>';
          paymentList +=   "<td>" + createDate + "</td>";
          paymentList +=   '<td><a href="' + value.addressInfoLink + '" target="_blank">' + value.address.substring(0, 12) + ' &hellip; ' + value.address.substring(value.address.length - 12) + '</td>';
          paymentList +=   '<td>' + _formatter(value.amount, 5, '') + '</td>';
          paymentList +=   '<td colspan="2"><a href="' + value.transactionInfoLink + '" target="_blank">' + value.transactionConfirmationData.substring(0, 16) + ' &hellip; ' + value.transactionConfirmationData.substring(value.transactionConfirmationData.length - 16) + ' </a></td>';
          paymentList += '</tr>';
        });
      } else {
        paymentList += '<tr><td colspan="4">No payments found yet</td></tr>';
      }
      $("#paymentList").html(paymentList);
    })
    .fail(function() {
      $.notify({ message: "Error: No response from API.<br>(loadPaymentsList)" }, { type: "danger", timer: 3000 });
    });
}

// Load CONNECTION page content
function loadConnectPage() {
  return $.ajax(API + "pools")
    .done(function(data) {
      var connectPoolConfig = "";
      $.each(data.pools, function(index, value) {
        if (currentPool === value.id) {
      defaultPort = Object.keys(value.ports)[0];
          coinName = value.coin.name;
      coinType = value.coin.type.toLowerCase();
      algorithm = value.coin.algorithm;
      
      connectPoolConfig += "<tr><td>Crypto Coin name</td><td>" + coinName + " (" + value.coin.type + ") </td></tr>";
      connectPoolConfig += "<tr><td>Coin Algorithm</td><td>" + value.coin.algorithm + "</td></tr>";
      connectPoolConfig += '<tr><td>Pool Wallet</td><td><a href="' + value.addressInfoLink + '" target="_blank">' + value.address.substring(0, 12) + " &hellip; " + value.address.substring(value.address.length - 12) + "</a></td></tr>";
      connectPoolConfig += "<tr><td>Payout Scheme</td><td>" + value.paymentProcessing.payoutScheme + "</td></tr>";
      connectPoolConfig += "<tr><td>Minimum Payment</td><td>" + value.paymentProcessing.minimumPayment + " " + value.coin.type + "</td></tr>";
      if (typeof value.paymentProcessing.minimumPaymentToPaymentId !== "undefined") {
        connectPoolConfig += "<tr><td>Minimum Payout (to Exchange)</td><td>" + value.paymentProcessing.minimumPaymentToPaymentId + "</td></tr>";
      }
      connectPoolConfig += "<tr><td>Pool Fee</td><td>" + value.poolFeePercent + "%</td></tr>";
      $.each(value.ports, function(port, options) {
        connectPoolConfig += "<tr><td>stratum+tcp://" + stratumAddress + ":" + port + "</td><td>";
        if (typeof options.varDiff !== "undefined" && options.varDiff != null) {
          connectPoolConfig += "Difficulty Variable / " + options.varDiff.minDiff + " &harr; ";
          if (typeof options.varDiff.maxDiff === "undefined" || options.varDiff.maxDiff == null) {
            connectPoolConfig += "&infin; ";
          } else {
            connectPoolConfig += options.varDiff.maxDiff;
          }
        } else {
          connectPoolConfig += "Difficulty Static / " + options.difficulty ;
        }
        connectPoolConfig += "</td></tr>";
      });
        }
      });
      connectPoolConfig += "</tbody>";
      $("#connectPoolConfig").html(connectPoolConfig);
    
    $("#miner-config").html("");
      $("#miner-config").load("poolconfig/" + coinType + ".html", function(response, status, xhr) {
          if (status == "error") {
      $("#miner-config").load("poolconfig/default.html", function(responseText) {
        var config = $("#miner-config").html()
          .replace(/{{ stratumAddress }}/g, coinType + "." + stratumAddress + ":" + defaultPort)
          .replace(/{{ coinName }}/g, coinName)
          .replace(/{{ aglorithm }}/g, algorithm);
        $(this).html(config);  
      });
      } else {
      var config = $("#miner-config").html()
        .replace(/{{ stratumAddress }}/g, coinType + "." + stratumAddress + ":" + defaultPort)
        .replace(/{{ coinName }}/g, coinName)
        .replace(/{{ aglorithm }}/g, algorithm);
            $(this).html(config);
      }
      });
    })
    .fail(function() {
      $.notify({ message: "Error: No response from API.<br>(loadConnectConfig)" }, { type: "danger", timer: 3000 });
    });
}

// Dashboard - load wallet stats
function loadWallet() {
  if ($("#walletAddress").val().length > 0) {
    localStorage.setItem(currentPool + "-walletAddress", $("#walletAddress").val());
  }
  var currentPage = window.location.hash.split(/[#/?]/)[2] || "stats";
  window.location.href = "#" + currentPool + "/" + currentPage + "?address=" + $("#walletAddress").val();
}

// General formatter function
function _formatter(value, decimal, unit) {
  if (value === 0) return "0 " + unit;
  
  var si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
    { value: 1e21, symbol: "Z" },
    { value: 1e24, symbol: "Y" }
  ];
  
  for (var i = si.length - 1; i > 0; i--) {
    if (value >= si[i].value) break;
  }
  
  return ((value / si[i].value).toFixed(decimal).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + " " + si[i].symbol + unit);
}

// Time convert Local -> UTC
function convertLocalDateToUTCDate(date, toUTC) {
  date = new Date(date);
  var localOffset = date.getTimezoneOffset() * 60000;
  var localTime = date.getTime();
  date = toUTC ? localTime + localOffset : localTime - localOffset;
  return new Date(date);
}

// Scroll to top off page
function scrollPageTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  var elmnt = document.getElementById("page-scroll-top");
  if (elmnt) elmnt.scrollIntoView();
}

// STATS page data
function loadStatsData() {
  return $.ajax(API + "pools")
    .done(function(data) {
      $.each(data.pools, function(index, value) {
        if (currentPool === value.id) {
      // SAFETY CHECK: Handle undefined stats during sync
      const poolStats = value.poolStats || {};
      const networkStats = value.networkStats || {};
      
      $("#blockchainHeight").text(networkStats.blockHeight || "Syncing...");
      $("#connectedPeers").text(networkStats.connectedPeers || "0");
      $("#minimumPayment").text(value.paymentProcessing.minimumPayment + " " + value.coin.type);
      $("#payoutScheme").text(value.paymentProcessing.payoutScheme);
      $("#poolFeePercent").text(value.poolFeePercent + " %");
      
          $("#poolHashRate").text(_formatter(poolStats.poolHashrate || 0, 5, "H/s"));
      $("#poolMiners").text((poolStats.connectedMiners || 0) + " Miner(s)");
          
          $("#networkHashRate").text(_formatter(networkStats.networkHashrate || 0, 5, "H/s"));
          $("#networkDifficulty").text(_formatter(networkStats.networkDifficulty || 0, 5, ""));
        }
      });
    })
    .fail(function() {
      $.notify({ message: "Error: No response from API.<br>(loadStatsData)" }, { type: "danger", timer: 3000 });
    });
}

// STATS page charts
function loadStatsChart() {
  return $.ajax(API + "pools/" + currentPool + "/performance")
    .done(function(data) {
      var labels = [];
    var poolHashRate = [];
      var networkHashRate = [];
      var networkDifficulty = [];
      var connectedMiners = [];
      var connectedWorkers = [];
      
      $.each(data.stats, function(index, value) {
        if (labels.length === 0 || (labels.length + 1) % 4 === 1) {
          var createDate = convertLocalDateToUTCDate(new Date(value.created), false);
          labels.push(createDate.getHours() + ":00");
        } else {
          labels.push("");
        }
    poolHashRate.push(value.poolHashrate || 0);
        networkHashRate.push(value.networkHashrate || 0);
    networkDifficulty.push(value.networkDifficulty || 0);
        connectedMiners.push(value.connectedMiners || 0);
        connectedWorkers.push(value.connectedWorkers || 0);
      });
    
      var options = {
    height: "200px",
        showArea: false,
        seriesBarDistance: 1,
        axisX: { showGrid: false },
        axisY: {
          offset: 47,
          scale: "logcc",
          labelInterpolationFnc: function(value) { return _formatter(value, 1, ""); }
        },
        lineSmooth: Chartist.Interpolation.simple({ divisor: 2 })
      };
    
      Chartist.Line("#chartStatsHashRate", {labels: labels, series: [networkHashRate]}, options);
      Chartist.Line("#chartStatsHashRatePool", {labels: labels, series: [poolHashRate]}, options);
      Chartist.Line("#chartStatsDiff", {labels: labels, series: [networkDifficulty]}, options);
      Chartist.Line("#chartStatsMiners", {labels: labels, series: [connectedMiners, connectedWorkers]}, options);
    })
    .fail(function() {
      $.notify({ message: "Error: No response from API.<br>(loadStatsChart)" }, { type: "danger", timer: 3000 });
    });
}

// DASHBOARD page data
function loadDashboardData(walletAddress) {
  return $.ajax(API + "pools/" + currentPool + "/miners/" + walletAddress)
    .done(function(data) {
      $("#pendingShares").text(_formatter(data.pendingShares, 0, ""));
      var workerHashRate = 0;
      if (data.performance) {
        $.each(data.performance.workers, function(index, value) {
          workerHashRate += value.hashrate || 0;
        });
      }
      $("#minerHashRate").text(_formatter(workerHashRate, 5, "H/s"));
      $("#pendingBalance").text(_formatter(data.pendingBalance, 5, ""));
      $("#paidBalance").text(_formatter(data.todayPaid, 5, ""));
      $("#lifetimeBalance").text(_formatter(data.pendingBalance + data.totalPaid, 5, ""));
    })
    .fail(function() {
      $.notify({ message: "Error: No response from API.<br>(loadDashboardData)" }, { type: "danger", timer: 3000 });
    });
}

// DASHBOARD page Miner table
function loadDashboardWorkerList(walletAddress) {
  return $.ajax(API + "pools/" + currentPool + "/miners/" + walletAddress)
    .done(function(data) {
      var workerList = "";
      var workerCount = 0;
      
      if (data.performance) {
        $.each(data.performance.workers, function(index, value) {
          workerCount++;
          workerList += "<tr>";
          workerList += "<td>" + workerCount + "</td>";
          workerList += "<td>" + (index.length === 0 ? "Unnamed" : index) + "</td>";
          workerList += "<td>" + _formatter(value.hashrate || 0, 5, "H/s") + "</td>";
          workerList += "<td>" + _formatter(value.sharesPerSecond || 0, 5, "S/s") + "</td>";
          workerList += "</tr>";
        });
      }
      
      if (workerCount === 0) {
        workerList += '<tr><td colspan="4">No workers active</td></tr>';
      }
      
      $("#workerCount").text(workerCount);
      $("#workerList").html(workerList);
    })
    .fail(function() {
      $.notify({ message: "Error: No response from API.<br>(loadDashboardWorkerList)" }, { type: "danger", timer: 3000 });
    });
}

// DASHBOARD page chart
function loadDashboardChart(walletAddress) {
  return $.ajax(API + "pools/" + currentPool + "/miners/" + walletAddress + "/performance")
    .done(function(data) {
    var labels = [];
        var minerHashRate = [];
    
        $.each(data, function(index, value) {
          if (labels.length === 0 || (labels.length + 1) % 4 === 1) {
            var createDate = convertLocalDateToUTCDate(new Date(value.created), false);
            labels.push(createDate.getHours() + ":00");
          } else {
            labels.push("");
          }
          var workerHashRate = 0;
          $.each(value.workers || [], function(index2, value2) {
            workerHashRate += value2.hashrate || 0;
          });
          minerHashRate.push(workerHashRate);
        });
        
        var options = {
          height: "200px",
      showArea: true,
      seriesBarDistance: 1,
          axisX: { showGrid: false },
          axisY: {
            offset: 47,
            labelInterpolationFnc: function(value) { return _formatter(value, 1, ""); }
          },
          lineSmooth: Chartist.Interpolation.simple({ divisor: 2 })
        };
        
        Chartist.Line("#chartDashboardHashRate", {labels: labels, series: [minerHashRate]}, options);
    })
    .fail(function() {
      $.notify({ message: "Error: No response from API.<br>(loadDashboardChart)" }, { type: "danger", timer: 3000 });
    });
}

// Generate Coin based sidebar
function loadNavigation() {
  return $.ajax(API + "pools")
    .done(function(data) {
    var coinLogo = "";
    var coinName = "";
    var poolList = "<ul class='navbar-nav '>";
      
      $.each(data.pools, function(index, value) {
    poolList += "<li class='nav-item'>";
        poolList += "  <a href='#" + value.id.toLowerCase() + "' class='nav-link coin-header" + 
          (currentPool == value.id.toLowerCase() ? " coin-header-active" : "") + "'>" +
          "  <img src='img/coin/icon/" + value.coin.type.toLowerCase() + ".png' /> " + value.coin.type +
          "</a>";
    poolList += "</li>";
    
    if (currentPool === value.id) {
      coinLogo = "<img style='width:40px' src='img/coin/icon/" + value.coin.type.toLowerCase() + ".png' />";
      coinName = value.coin.name || value.coin.type;
    }
      });
      
      poolList += "</ul>";
    $(".coin-list-header").html(poolList);
    
    var sidebarList = "";
    const sidebarTemplate = $(".sidebar-template").html();
      sidebarList += sidebarTemplate
    .replace(/{{ coinId }}/g, currentPool)
    .replace(/{{ coinLogo }}/g, coinLogo)
    .replace(/{{ coinName }}/g, coinName);
      
      $(".sidebar-wrapper").html(sidebarList);
  
      $("a.link").each(function() {
      if (localStorage[currentPool + "-walletAddress"] && this.href.indexOf("/dashboard") > 0) {
      this.href = "#" + currentPool + "/dashboard?address=" + localStorage[currentPool + "-walletAddress"];
      } 
      });
    })
    .fail(function() {
      $.notify({ message: "Error: No response from API.<br>(loadNavigation)" }, { type: "danger", timer: 3000 });
    });
}