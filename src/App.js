import React, { Component } from "react";

import "react-table/react-table.css";

import { defaults } from "react-chartjs-2";

// import { Bar } from "react-chartjs-2";

import { BigNumber } from "bignumber.js";

import TokenPoolDetails from "./components/TokenPoolDetails";
// import TokenPoolHistory from "./components/TokenPoolHistory";
// import TokenDropdown from "./components/TokenDropdown";
import Header from "./components/Header";
import Container, { Grid } from "./components/Container";
import Attribution from "./components/Attribution";

import MultiCallAbi from "./constants/MultiCallAbi.js";
import FactoryAbi from "./constants/FactoryAbi.js";
import PairAbi from "./constants/PairAbi.js";
import ERC20Abi from "./constants/ERC20Abi.js";

import Web3 from 'web3'

import "typeface-inter";
import "./App.css";

var app;

var web3 = null;

const BN = Web3.utils.BN;
const fromWei = Web3.utils.fromWei;
const FACTORY_ADDRESS = '0xfaa7762f551bba9b0eba34d6443d49d0a577c0e1';
const MULTICALL_ADDRESS = '0x4eeebb5580769ba6d26bfd07be636300076d1831';
var didRequestData = false;
var didReceiveData = false;
var loadingUpToBlockNum = 0;
var maxBlockNum = 0;

var eventList = [];
var pairsList = [];
var tokensTotals = {};
var tokensList = {};

var volumeDataMap = {}; // how much trading volume keyed by day

var ethLiquidityDataMap = {}; // how much liquidity in pool keyed by day (eth)
var tokenLiquidityDataMap = {}; // how much liquidity in pool keyed by day (token)

var curSymbol = "";

var curEthPoolTotal = "-";
var curTokenPoolTotal = "-";
var curPoolShare = "-";

var myCollectedEthFees = "";
var myCollectedTokenFees = "";

var myAddress = "";
var tokenAddress = "";

var exchangeRate = 0;

var providerFeePercent = 0.003;

const tokenOptions = [];

function GetEthToTokenPrice(ethReserve, tokenReserve) {
  var inputEthWithFee = 1 - providerFeePercent;
  var numerator = inputEthWithFee * tokenReserve;
  var denominator = ethReserve + inputEthWithFee;

  var rate = numerator / denominator;
  if (rate > 0) {
    return rate;
  } else {
    return 0;
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    app = this;

    defaults.global.animation = false;
  }

  componentDidMount(props) {
    //retrieveData();
    retrievePairs();
  }

  componentWillMount(props) {

    // for (var token in RskSwap.tokens) {
    //   tokenOptions.push({
    //     value: token,
    //     label: `${token} - ${RskSwap.tokens[token].address}`
    //   });
    // }
  }

  // onTokenSelected(option) {
  //   var symbol = option.value;

  //   console.log(symbol);

  //   curSymbol = symbol;
  //   tokenAddress = "";

  //   didRequestData = false;
  //   didReceiveData = false;
  //   loadingUpToBlockNum = 0;
  //   maxBlockNum = 0;

  //   eventList = [];

  //   volumeDataMap = {};

  //   ethLiquidityDataMap = {};
  //   tokenLiquidityDataMap = {};

  //   curEthPoolTotal = "-";
  //   curTokenPoolTotal = "-";
  //   curPoolShare = "-";

  //   myCollectedEthFees = "";
  //   myCollectedTokenFees = "";

  //   exchangeRate = 0;

  //   app.setState({});

  //   let exchangeAddress = RskSwap.tokens[curSymbol].address;

  //   retrieveData(curSymbol, exchangeAddress);
  // }
  dataList = [];
  render() {

    return (
      <Container>
        {/* @TODO: find better way to handle this */}
        <div hidden>
          <Web3Setter />
        </div>

        <Header>
          {/* @NOTE: Index 77 of tokenOptions is DAI */}
          {/* <TokenDropdown
            options={tokenOptions}
            defaultValue={tokenOptions[77]}
            onChange={this.onTokenSelected}
          /> */}
        </Header>

        <Grid>
          <div className="TokenDetails">
            <TokenPoolDetails
              pairsList={pairsList}
              tokensList={tokensList}
              myAddress={myAddress}
            />

            {/* <TokenChart /> */}
          </div>

          {/* <div className="TokenHistory">
            <TokenPoolHistory
              eventList={eventList}
              curSymbol={curSymbol}
              myAddress={myAddress}
              didReceiveData={didReceiveData}
              loadingUpToBlockNum={loadingUpToBlockNum}
              maxBlockNum={maxBlockNum}
            />
          </div> */}

          <div className="Attribution">
            <Attribution />
          </div>
        </Grid>
        {/* <!-- The core Firebase JS SDK is always required and must be listed first --> */}
        <script src="/__/firebase/7.19.1/firebase-app.js"></script>

        {/* <!-- TODO: Add SDKs for Firebase products that you want to use
            https://firebase.google.com/docs/web/setup#available-libraries --> */}
        <script src="/__/firebase/7.19.1/firebase-analytics.js"></script>

        {/* <!-- Initialize Firebase --> */}
        <script src="/__/firebase/init.js"></script>
      </Container>
    );
  }
}

const Web3Setter = props => {
  if (web3 === null) {
    web3 = new Web3(Web3.givenProvider || 'https://public-node.rsk.co/')
  }
  return <div />
};

// const TokenChart = props => {
//   // don't render anything if we haven't loaded the events yet
//   if (didReceiveData === false) {
//     return <div />;
//   }

//   var labels = [];

//   var volumeData = [];

//   var ethLiquidityData = [];
//   var tokenLiquidityData = [];
//   var ethPriceData = [];

//   var monthNames = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec"
//   ];

//   // calculate dataset
//   var numDaysBackToCalculate = 720;
//   var numDaysToShowOnChart = 60;

//   var oneDayOffset = 24 * 60 * 60 * 1000; // in milliseconds

//   var currentEthLiquidity = 0;
//   var currentTokenLiquidity = 0;

//   for (var daysBack = numDaysBackToCalculate; daysBack >= 0; daysBack--) {
//     var date = new Date(Date.now() - oneDayOffset * daysBack);
    
//     var dateKey = date.getMonth() + "-" + date.getDate() + "-" + date.getFullYear();

//     // track eth liquidity
//     if (dateKey in ethLiquidityDataMap) {
//       currentEthLiquidity += ethLiquidityDataMap[dateKey];
//     }

//     // track token liquidity
//     if (dateKey in tokenLiquidityDataMap) {
//       currentTokenLiquidity += tokenLiquidityDataMap[dateKey];
//     }

//     if (daysBack > numDaysToShowOnChart) {
//       continue;
//     }

//     labels.push(
//       monthNames[date.getMonth()] +
//         " " +
//         date.getDate() +
//         ", " +
//         date.getFullYear()
//     );

//     if (dateKey in volumeDataMap) {
//       volumeData.push(volumeDataMap[dateKey].toFixed(4));
//     } else {
//       volumeData.push(0);
//     }
    
//     ethLiquidityData.push(currentEthLiquidity.toFixed(4));

//     tokenLiquidityData.push(currentTokenLiquidity.toFixed(4));

//     // calculate the price of the token on this given day
//     ethPriceData.push(GetEthToTokenPrice(currentEthLiquidity, currentTokenLiquidity).toFixed(4));
//   }

//   // don't even show liquidity points if there was no liquidity at all
//   if (Object.keys(ethLiquidityDataMap).length === 0) {
//     ethLiquidityData = [];
//   }
//   // don't even show liquidity points if there was no liquidity at all
//   if (Object.keys(tokenLiquidityDataMap).length === 0) {
//     tokenLiquidityData = [];
//   }

//   var tokenLiquidityLabel = "Liquidity (" + curSymbol + ")";

//   const data = {
//     datasets: [
//       {
//         label: "Liquidity (ETH)",
//         type: "line",
//         data: ethLiquidityData,

//         lineTension: 0,

//         borderColor: "rgba(251,167,27,1)",
//         pointBorderColor: "rgba(251,167,27,1)",
//         pointBackgroundColor: "rgba(251,167,27,1)",

//         pointRadius: 1,
//         pointHitRadius: 4,
//         pointHoverRadius: 3,

//         yAxisID: "y-axis-2"
//       },
//       {
//         label: tokenLiquidityLabel,
//         type: "line",
//         data: tokenLiquidityData,

//         lineTension: 0,

//         borderColor: "rgba(87,183,87,1)",
//         pointBorderColor: "rgba(87,183,87,1)",
//         pointBackgroundColor: "rgba(87,183,87,1)",

//         pointRadius: 1,
//         pointHitRadius: 4,
//         pointHoverRadius: 3,
//         yAxisID: "y-axis-2"
//       },
//       {
//         label: "Rate",
//         type: "line",
//         data: ethPriceData,

//         lineTension: 0,

//         borderColor: "rgba(243, 98, 45,1)",
//         pointBorderColor: "rgba(243, 98, 45,1)",
//         pointBackgroundColor: "rgba(243, 98, 45,1)",

//         pointRadius: 1,
//         pointHitRadius: 4,
//         pointHoverRadius: 3,
//         yAxisID: "y-axis-2"
//       },
//       {
//         type: "bar",
//         label: "Trade Volume (ETH)",
//         data: volumeData,
//         fill: false,
//         backgroundColor: "rgba(160,160,160, 0.4)",

//         hoverBackgroundColor: "rgba(231,82,232,0.4)",
//         hoverBorderColor: "rgba(102,153,203,0.4)",

//         yAxisID: "y-axis-1"
//       }
//     ]
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     tooltips: {
//       mode: "label"
//     },
//     elements: {
//       line: {
//         fill: false
//       }
//     },
//     scales: {
//       xAxes: [
//         {
//           display: true,
//           gridLines: {
//             display: false
//           },
//           labels: labels
//         }
//       ],
//       yAxes: [
//         {
//           type: "linear",
//           display: true,
//           position: "left",
//           id: "y-axis-1",
//           gridLines: {
//             display: false
//           },
//           labels: {
//             show: true
//           }
//         },
//         {
//           type: "linear",
//           display: true,
//           position: "right",
//           id: "y-axis-2",
//           gridLines: {
//             display: false
//           },
//           labels: {
//             show: true
//           }
//         }
//       ]
//     }
//   };

//   return (
//     <div className="TokenChart">
//       <Bar
//         data={data}
//         // height={250}
//         options={chartOptions}
//       />
//     </div>
//   );
// };

const retrievePairs = async () => {
  myAddress = web3.account;
  var factoryContract = new web3.eth.Contract(
    FactoryAbi,
    FACTORY_ADDRESS
  );
  var pairsLength = await factoryContract.methods.allPairsLength().call();
  console.log(pairsLength);

  var multiCallContract = new web3.eth.Contract(
    MultiCallAbi,
    MULTICALL_ADDRESS
  );

  var calls = [];
  for(let i=0; i < pairsLength; i++){
    calls.push({target:FACTORY_ADDRESS, callData:factoryContract.methods.allPairs(i).encodeABI()});
  }
  
  let results = await multiCallContract.methods.aggregate(calls).call();

  let pairsAddresses = results.returnData.map((data) => web3.eth.abi.decodeParameter('address', data));
  var pairContract = new web3.eth.Contract(
    PairAbi,
    FACTORY_ADDRESS // We are not using the address
  );

  calls = [];
  for(let i=0; i < pairsLength; i++) {
    let pairAddress = pairsAddresses[i];
    calls.push({target:pairAddress, callData:pairContract.methods.token0().encodeABI()});
    calls.push({target:pairAddress, callData:pairContract.methods.token1().encodeABI()});
    calls.push({target:pairAddress, callData:pairContract.methods.getReserves().encodeABI()});
  }

  results = await multiCallContract.methods.aggregate(calls).call();
  
  pairsList = [];
  tokensTotals = {};
  for(let i=0; i < pairsLength; i++){
    let token0 = web3.eth.abi.decodeParameter('address', results.returnData[i*3]);
    let token1 = web3.eth.abi.decodeParameter('address', results.returnData[i*3+1]);
    let reserves = web3.eth.abi.decodeParameters(['uint112', 'uint112', 'uint32'], results.returnData[i*3+2]);
    let reserveToken0 =  parseFloat(reserves[0]);
    let reserveToken1 = parseFloat(reserves[1]);
    
    tokensTotals[token0] = reserveToken0 + tokensTotals[token0] || 0;
    tokensTotals[token1] = reserveToken1 + tokensTotals[token0] || 0;

    pairsList.push({
      address: pairsAddresses[i],
      token0: token0,
      token1: token1,
      reserveToken0: reserveToken0,
      reserveToken1: reserveToken1,
    });
  }
  
  console.log(pairsList);
  console.log(tokensTotals);
  var erc20Contract = new web3.eth.Contract(
    ERC20Abi,
    FACTORY_ADDRESS // We are not using the address
  );

  calls = [];
  for(var tokenAddress in tokensTotals) {
    calls.push({target:tokenAddress, callData:erc20Contract.methods.decimals().encodeABI()});
    calls.push({target:tokenAddress, callData:erc20Contract.methods.symbol().encodeABI()});
  }

  results = await multiCallContract.methods.aggregate(calls).call();

  tokensList = {};
  let count = 0;
  for(var tokenAddress in tokensTotals) {
    tokensList[tokenAddress] = {
      decimals: web3.eth.abi.decodeParameter('uint8', results.returnData[count++]),
      symbol: web3.eth.abi.decodeParameter('string', results.returnData[count++])
    }
  }

  app.setState({});
}

// const retrieveData = async (tokenSymbol, exchangeAddress) => {
//   if (didRequestData) {
//     return;
//   }

//   // get the token address
//   var tokenDecimals = Math.pow(10, RskSwap.tokens[tokenSymbol].decimals);

//   var exchangeContract = new web3.eth.Contract(
//     RskSwap.abi,
//     exchangeAddress
//   );

//   // fetch the token address
//   tokenAddress = RskSwap.tokens[tokenSymbol].tokenAddress;

//   didRequestData = true;

//   myAddress = web3.account;

//   // var latestBlockObj = await web3.eth.getBlock('latest');

//   // var latestBlock = latestBlockObj["number"];

//   // maxBlockNum = latestBlock;

//   // // paginate through the logs to load all the events
//   var events = [];

//   // var DEFAULT_BLOCK_PAGE_AMOUNT = 100000;
  
//   // var blockPageAmount = DEFAULT_BLOCK_PAGE_AMOUNT; // this will adjust to get around a known Infura issue for 1000+ RPC return results 
//   // // https://github.com/AugurProject/augur-node/issues/848

//   // var fromBlock = RskSwap.originBlock;
//   // var toBlock = fromBlock + blockPageAmount;

//   // var options = {
//   //   address: exchangeAddress    
//   // };

//   // while (true) {
//   //   options["fromBlock"] = fromBlock;
//   //   options["toBlock"] = toBlock;

//   //   console.log("Retrieving data for exchange " + exchangeAddress + " from block " + fromBlock + " to " + toBlock);  

//   //   try {
//   //     await exchangeContract.getPastEvents("allEvents", options).then(responseEvents => {
//   //       responseEvents.forEach(event => {
//   //         events.push(event);
//   //       });
//   //     });
//   //   } catch (error) {
//   //     console.log(error);

//   //     // if we encounter an error, try again with fetching less blocks
//   //     blockPageAmount = Math.round(blockPageAmount / 2);

//   //     // re-adjust the toblock
//   //     toBlock = fromBlock + blockPageAmount;
//   //     toBlock = Math.min(toBlock, latestBlock);
      
//   //     continue;
//   //   };

//   //   // if we've reached the end of the pages
//   //   if (toBlock >= latestBlock) {
//   //     break;
//   //   }

//   //   // if the symbol has changed while we were loading
//   //   if (curSymbol !== tokenSymbol) {
//   //     break;
//   //   }

//   //   // reset the block page amount once we have a successful fetch
//   //   blockPageAmount = DEFAULT_BLOCK_PAGE_AMOUNT;

//   //   fromBlock = toBlock + 1;
//   //   toBlock = fromBlock + blockPageAmount;
//   //   toBlock = Math.min(toBlock, latestBlock);

//   //   loadingUpToBlockNum = toBlock;

//   //   // update our state
//   //   app.setState({});
//   // }

//   // only continue if the current exchange is the original symbol we requested
//   if (curSymbol !== tokenSymbol) {
//     return;
//   }

//   console.log(events);

//   let eventListTemp = [];

//   let curEthTotal = 0;
//   let curTokenTotal = 0;

//   curPoolShare = 0.0;

//   let curPoolShareDisplay = 0.0;

//   let numMyShareTokens = new BigNumber(0);
//   let numMintedShareTokens = new BigNumber(0);

//   let numMyDepositedEth = 0.0;
//   let numMyDepositedTokens = 0.0;

//   let lastEventObj;

//   events.forEach(e => {
//     let eventType = e.event;

//     let eventObj = {
//       type: eventType,

//       curPoolShare: 0.0,

//       numEth: 0,
//       numTokens: 0,

//       id: e.id,

//       tx: e.transactionHash,
//       provider: e.returnValues.provider,
//       block: e.blockNumber,

//       liquidtyProviderFee: "-",

//       volume: 0 // how much swapping volume was in this event (set by purchase events only)
//     };

//     let eth, tokens;

//     if (eventType === "AddLiquidity") {
//       eth = e.returnValues[1] / 1e18;
//       tokens = e.returnValues.token_amount / tokenDecimals;

//       eventObj.type = "Add Liquidty";

//       if (eventObj.provider.toUpperCase() === myAddress.toUpperCase()) {
//         numMyDepositedEth += eth;
//         numMyDepositedTokens += tokens;
//       }
//     } else if (eventType === "RemoveLiquidity") {
//       eth = -e.returnValues.eth_amount / 1e18;
//       tokens = -e.returnValues.token_amount / tokenDecimals;

//       eventObj.type = "Remove Liquidty";

//       if (eventObj.provider.toUpperCase() === myAddress.toUpperCase()) {
//         numMyDepositedEth += eth;
//         numMyDepositedTokens += tokens;
//       }
//     } else if (eventType === "TokenPurchase") {
//       eth = e.returnValues.eth_sold / 1e18;
//       tokens = -e.returnValues.tokens_bought / tokenDecimals;

//       eventObj.provider = e.returnValues.buyer;
//       eventObj.type = "Token Purchase";

//       eventObj.volume = eth;

//       // calculate the eth fee that liquidity providers will receive
//       eventObj.liquidtyProviderFee =
//         (eth * providerFeePercent).toFixed(4) + " ETH";
//     } else if (eventType === "EthPurchase") {
//       eth = -e.returnValues.eth_bought / 1e18;
//       tokens = e.returnValues.tokens_sold / tokenDecimals;

//       eventObj.provider = e.returnValues.buyer;
//       eventObj.type = "Eth Purchase";

//       eventObj.volume = -eth;

//       // calculate the token fee that liquidity providers will receive
//       eventObj.liquidtyProviderFee =
//         (tokens * providerFeePercent).toFixed(4) + " " + tokenSymbol;
//     } else if (eventType === "Approval") {
//     	// ignore Approval events
//     	return;
//     } else if (eventType === "Transfer") {
//       // Track share tokens
//       let sender = e.returnValues[0];
//       let receiver = e.returnValues[1];
//       let numShareTokens = new BigNumber(e.returnValues[2]); // / 1e18;

//       // check if this was mint or burn share tokens
//       if (receiver === "0x0000000000000000000000000000000000000000") {
//         // burn share tokens
//         numMintedShareTokens = numMintedShareTokens.minus(numShareTokens);

//         // check if the sender was user
//         if (sender.toUpperCase() === myAddress.toUpperCase()) {
//           numMyShareTokens = numMyShareTokens.minus(numShareTokens);
//         }
//       } else if (sender === "0x0000000000000000000000000000000000000000") {
//         // mint share tokens
//         numMintedShareTokens = numMintedShareTokens.plus(numShareTokens);

//         if (receiver.toUpperCase() === myAddress.toUpperCase()) {
//           numMyShareTokens = numMyShareTokens.plus(numShareTokens);
//         }
//       } else {
//         // this is a normal transfer, not a mint or burn
//         return;
//       }

//       // update current pool share. take users's share tokens and divide by total minted share tokens
//       curPoolShare = new BigNumber(
//         numMyShareTokens.dividedBy(numMintedShareTokens)
//       );

//       if (isNaN(curPoolShare) || curPoolShare.toFixed(4) === 0) {
//         curPoolShare = 0;
//         numMyDepositedEth = 0;
//         numMyDepositedTokens = 0;
//       }

//       // get a percentage from the pool share
//       curPoolShareDisplay = (curPoolShare * 100).toFixed(2);

//       // if the user's pool share is 0, don't show a number
//       if (Number(curPoolShareDisplay) === 0.0) {
//         curPoolShareDisplay = "-";
//       } else {
//         curPoolShareDisplay = curPoolShareDisplay + "%"; // add a percentage symbol
//       }

//       // set it on the last event object before this transfer
//       lastEventObj.curPoolShare = curPoolShareDisplay;

//       return;
//     }

//     // save a reference to the last event object (transfer events follow add/remove liquidity)
//     lastEventObj = eventObj;

//     // update the total pool eth total
//     curEthTotal += eth;

//     // update the total pool token total
//     curTokenTotal += tokens;

//     // set the number of eth and tokens for this event
//     eventObj.numEth = eth;
//     eventObj.numTokens = tokens;

//     // set the user's current pool share %
//     eventObj.curPoolShare = curPoolShareDisplay;

//     // push this event object onto the array
//     eventListTemp.push(eventObj);
//   });

//   // reverse the list so the most recent events are first
//   eventListTemp.reverse();

//   // calculate how much fees we've accrued by determining how much eth/tokens we own minus what we've deposited/withdrawn
//   let myEstimatedAccruedEthFees = (
//     curPoolShare * curEthTotal -
//     numMyDepositedEth
//   ).toFixed(4);
//   let myEstimatedAccruedTokenFees = (
//     curPoolShare * curTokenTotal -
//     numMyDepositedTokens
//   ).toFixed(4);

//   if (Number(myEstimatedAccruedEthFees) === 0) {
//     myEstimatedAccruedEthFees = "";
//   } else {
//     myEstimatedAccruedEthFees = myEstimatedAccruedEthFees + " ETH";
//   }

//   if (Number(myEstimatedAccruedTokenFees) === 0) {
//     myEstimatedAccruedTokenFees = "";
//   } else {
//     if (myEstimatedAccruedEthFees.length === 0) {
//       myEstimatedAccruedTokenFees =
//         myEstimatedAccruedTokenFees + " " + tokenSymbol;
//     } else {
//       myEstimatedAccruedTokenFees =
//         ", " + myEstimatedAccruedTokenFees + " " + tokenSymbol;
//     }
//   }
//   didReceiveData = true;

//   eventList = eventListTemp;

//   curEthPoolTotal = curEthTotal.toFixed(4);
//   curTokenPoolTotal = curTokenTotal.toFixed(4);

//   curPoolShare = curPoolShareDisplay;

//   myCollectedEthFees = myEstimatedAccruedEthFees;
//   myCollectedTokenFees = myEstimatedAccruedTokenFees;

//   // update our state
//   app.setState({});

//   if (eventListTemp.length > 0) {
//     var recentEvent = eventListTemp[0];
//     var oldestEvent = eventListTemp[eventListTemp.length - 1];

//     var dateKeyToVolumeMap = {};

//     var dateKeyToEthLiquidityMap = {};
//     var dateKeyToTokenLiquidityMap = {};

//     // get the timestamp for the most recent block
//     web3.eth.getBlock(recentEvent.block).then(function(recentBlock) {
//       var mostRecentBlockTimestamp = recentBlock.timestamp;
//       var mostRecentBlockNum = recentBlock.number;

//       // get the timestamp for the oldest block
//       web3.eth.getBlock(oldestEvent.block).then(function(oldestBlock) {
//         // only continue if the current exchange is the original symbol we requested
//         if (curSymbol !== tokenSymbol) {
//           return;
//         }

//         var oldestBlockTimestamp = oldestBlock.timestamp;
//         var oldestBlockNum = oldestBlock.number;

//         var blockBounds = mostRecentBlockNum - oldestBlockNum;
//         var timestampBoundsInSeconds =
//           mostRecentBlockTimestamp - oldestBlockTimestamp;

//         // now we have our bounds. determine a timestamp for each of the block numbers in the event list
//         eventList.forEach(e => {
//           var blockRatio =
//             blockBounds > 0 ? (e.block - oldestBlockNum) / blockBounds : 1;

//           var blockTimestampInSeconds =
//             blockRatio * timestampBoundsInSeconds + oldestBlockTimestamp;

//           // calculate which date time this block number falls under
//           var blockDay = new Date(blockTimestampInSeconds * 1000);

//           var dateKey =
//             blockDay.getMonth() +
//             "-" +
//             blockDay.getDate() +
//             "-" +
//             blockDay.getFullYear();

//           // console.log(e.block + "  " + oldestBlockNum  + "  " + dateKey + "  " + e.volume);//+ "  "  + mostRecentBlockNum + "   " + blockRatio + "  " + dateKey);

//           // update volume bucket for this date
//           if (e.volume > 0) {
//             if (!(dateKey in dateKeyToVolumeMap)) {
//               dateKeyToVolumeMap[dateKey] = 0;
//             }
//             dateKeyToVolumeMap[dateKey] += e.volume;
//           }

//           // update eth liquidity bucket for this date
//           if (e.numEth !== 0) {
//             if (!(dateKey in dateKeyToEthLiquidityMap)) {
//               dateKeyToEthLiquidityMap[dateKey] = 0;
//             }

//             dateKeyToEthLiquidityMap[dateKey] += e.numEth;
//           }

//           // update token liquidity bucket for this date
//           if (e.numTokens !== 0) {
//             if (!(dateKey in dateKeyToTokenLiquidityMap)) {
//               dateKeyToTokenLiquidityMap[dateKey] = 0;
//             }

//             dateKeyToTokenLiquidityMap[dateKey] += e.numTokens;
//           }
//         });

//         volumeDataMap = dateKeyToVolumeMap;

//         ethLiquidityDataMap = dateKeyToEthLiquidityMap;
//         tokenLiquidityDataMap = dateKeyToTokenLiquidityMap;

//         didReceiveData = true;

//         exchangeRate = GetEthToTokenPrice(curEthTotal, curTokenTotal);

//         app.setState({});
//       });
//     });
//   } else {
//     didReceiveData = true;

//     app.setState({});
//   }

//   app.setState({});
// };

export default App;
