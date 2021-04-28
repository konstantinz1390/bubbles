import { DEAL_SIDE } from '../../constants/dealsConstants';

export const getPips = (deal, quoteSettings, quote) => {
    if (quote.askPrice !== '-' && quote.bidPrice !== '-') {
        if (deal.side.toUpperCase() === DEAL_SIDE.BUY) {
            return Math.trunc((quote.bidPrice * 1000000 - deal.openPrice * 1000000) / quoteSettings.tickSize);
        } else {
            return Math.trunc((deal.openPrice * 1000000 - quote.askPrice * 1000000) / quoteSettings.tickSize);
        }
    } else {
        return null;
    }
};

export const getBubbleSizeList = (dealsList, maxBubbleSize = 200, minBubbleSize = 50, maxLabelSize = 65, minLabelSize = 14) => {
    const pipsPositive = dealsList.map(deal => Math.abs(deal.pips));
    const maxPipsValue = Math.max(...pipsPositive);
    const minPipsValue = Math.min(...pipsPositive);
    const sizeFactor = (maxBubbleSize - minBubbleSize) / (maxPipsValue - minPipsValue);
    const labelSizeFactor = (maxLabelSize - minLabelSize) / (maxPipsValue - minPipsValue);
    return pipsPositive.map((pips, index) => (
        {
            ...dealsList[index],
            size: ((pips - minPipsValue) * sizeFactor) + minBubbleSize,
            labelSize: ((pips - minPipsValue) * labelSizeFactor) + minLabelSize,
            itemColor: dealsList[index].pips >= 0 ? '#39EDC4' : '#F34646',
        }
    ));
};
