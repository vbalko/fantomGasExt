
let timer;
let reConnectTimes = 0;


const showBadge = (price) => {
    chrome.action.setBadgeText({text: price.toString()});
}

const onInstalled = () => {
    periodFetchGas();
}

const onStartup = () => {
    periodFetchGas();
}

const periodFetchGas = () => {
    getGas();
}

chrome.runtime.onInstalled.addListener(onInstalled);
chrome.runtime.onStartup.addListener(onStartup);

const formatPrice = (price) => (price === null ? '...' : Math.trunc(price));

const saveToStorage = (gasPrice) => {
    const arr = [
        formatPrice(gasPrice.SafeGasPrice),
        formatPrice(gasPrice.ProposeGasPrice),
        formatPrice(gasPrice.FastGasPrice),
        gasPrice.UsdPrice
    ];

    chrome.storage.local.set({
        array: arr,
        timestamp: gasPrice.LastBlock
    },() => {
        console.log(`ulozeno ${arr}`);
        // showPopupContent();
    })
}

// send message to popup page
// function showPopupContent() {
//     chrome.storage.local.get(['array'],({ array }) => {
//         chrome.runtime.sendMessage({ array },(res) => {
//             console.log("res",res);
//           });
//       })
//   }

/*
{
"status": "1",
"message": "OK",
"result": {
"LastBlock": "28992192",
"SafeGasPrice": "662.1344",
"ProposeGasPrice": "662.1344",
"FastGasPrice": "1008.128",
"UsdPrice": "2.32"
}
}
*/

function fetchGasData() {
    clearTimeout(timer);
    fetch("https://gftm.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle", {
        method: "GET"
    })
    .then((res) => res.json())
    .then((json) => {
        console.dir(json);
        reConnectTimes = 0;
        timer = setTimeout(() => {
            getGas();
        },10000);
        saveToStorage(json.result)
        updateDOM(json.result);        
    })
    .catch((err) => {
        //refresh 20 times
        if (reConnectTimes < 20) { reConnectTimes++ };
        timer = setTimeout(getGas, reConnectTimes < 20 ? 1000 : 10000);
    })
}

function getGas() {
    fetchGasData();
}

function updateDOM (data) {
    
    const formatted = {
        standard: formatPrice(data.SafeGasPrice),
        fast: formatPrice(data.ProposeGasPrice),
        rapid: formatPrice(data.FastGasPrice)
    }
    // document.getElementById("fantom-standard").innerHTML = `${formatted.standard} Gwei`;
    // document.getElementById("fantom-fast").innerHTML = `${formatted.fast} Gwei`;
    // document.getElementById("fantom-rapid").innerHTML = `${formatted.rapid} Gwei`;
    showBadge(formatted.standard);
}

