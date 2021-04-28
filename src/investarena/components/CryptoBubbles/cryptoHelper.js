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
    const pnlPositive = dealsList.map(deal => Math.abs(deal.pnl));
    const maxPnlValue = Math.max(...pnlPositive);
    const minPnlValue = Math.min(...pnlPositive);
    const sizeFactor = (maxBubbleSize - minBubbleSize) / (maxPnlValue - minPnlValue);
    const labelSizeFactor = (maxLabelSize - minLabelSize) / (maxPnlValue - minPnlValue);
    return pnlPositive.map((pnl, index) => (
        {
            ...dealsList[index],
            size: ((pnl - minPnlValue) * sizeFactor) + minBubbleSize,
            labelSize: ((pnl - minPnlValue) * labelSizeFactor) + minLabelSize,
            itemColor: dealsList[index].pnl >= 0 ? '#39EDC4' : '#F34646',
        }
    ));
};
