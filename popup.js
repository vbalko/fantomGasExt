
document.addEventListener('DOMContentLoaded', function () {
    const refreshButtonEl = document.querySelector('#refresh-button');
    refreshButtonEl.addEventListener('click', () => {
        console.log('klik');
        // if (refreshButtonEl.getAttribute('data-content-loaded') === 'true') {
            // console.log('klik2');
        //   refreshButtonEl.setAttribute('data-content-loaded', 'false');
          chrome.runtime.sendMessage({ action: 'refresh-data' });
        // }
      });

    
    chrome.storage.local.get(['array'],(res) => {
        const newPrices = res.array;
        setGasPrices(newPrices);        
    });

    // setInterval(() => chrome.runtime.sendMessage({ action: 'refresh-data' }),5000);
    chrome.runtime.sendMessage({ action: 'refresh-data' });
});

const handleMessagePrices = () => {
    chrome.runtime.onMessage.addListener(({
        array
    }, messageSender, sendResponse) => {
        console.log(messageSender.tab ?
            "from a content script:" + messageSender.tab.url :
            "from the extension");
        setGasPrices(array);
        return true;
    })
}

const setGasPrices = (array) => {
    const prices = {
        standard: array[0],
        fast: array[1],
        rapid: array[2],
        fantom: array[3]
    }

    document.getElementById("fantom-standard").innerHTML = `${prices.standard} Gwei`;
    document.getElementById("fantom-fast").innerHTML = `${prices.fast} Gwei`;
    document.getElementById("fantom-rapid").innerHTML = `${prices.rapid} Gwei`;
    document.getElementById("fantom-price").innerHTML = `$${prices.fantom}`;
}

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.array) {
        const newPrices = changes.array.newValue;
        setGasPrices(newPrices);
    }
})



