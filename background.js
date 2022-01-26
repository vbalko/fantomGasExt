let timer;
let reConnectTimes = 0;


const showBadge = (price) => {
    chrome.action.setBadgeText({
        text: price.toString()
    });
}

const onInstalled = () => {
    // setInterval(() => fetchGasData,5000);
    periodFetchGas();
    createAlarm();
    onAlarm();
}

const onStartup = () => {
    // setInterval(() => fetchGasData,5000);
    periodFetchGas();
}

const periodFetchGas = () => {
    getGas();
    
    
}

const createAlarm = () => {
    console.log('createAlarm');
    chrome.alarms.get('fetchFantomPrices', alarm => {
        if (!alarm) {
            chrome.alarms.create('fetchFantomPrices', {
                periodInMinutes: 1,
                when: Date.now()
            });
        }
    })

}

const onAlarm = () => {
    console.log('onAlarm outside');
    chrome.alarms.onAlarm.addListener((alarm) => {
        console.log('onAlarm',alarm);
        getGas('Alarm');
    })
}

chrome.runtime.onInstalled.addListener(onInstalled);
chrome.runtime.onStartup.addListener(onStartup);

onAlarm();

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
    }, () => {
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
            saveToStorage(json.result)
            updateBadge(json.result);
            reConnectTimes = 0;
            // timer = setTimeout(() => {
            //     getGas();
            // }, 5000);
        })
        .catch((err) => {
            //refresh 20 times
            if (reConnectTimes < 20) {
                reConnectTimes++
            };
            timer = setTimeout(getGas, reConnectTimes < 20 ? 1000 : 10000);
        })
}

function getGas(from = '') {
    if (from) {
        console.log('from: ',from);
    }
    
    fetchGasData();
}

function updateBadge(data) {
    chrome.action.setBadgeBackgroundColor({
        color: '#ffffff'
    });
    const formatted = {
        standard: formatPrice(data.SafeGasPrice)
    }
    showBadge(formatted.standard);
    setTimeout(() => chrome.action.setBadgeBackgroundColor({
        color: '#337afe'
    }), 100);
}

chrome.runtime.onMessage.addListener(({
    action,
    ...data
} = {}) => {
    console.log('klik-back');
    if (action === 'refresh-data') fetchGasData();
    // if (action === 'update-badge-source') setStoredBadgeSource(data.badgeSource);
});