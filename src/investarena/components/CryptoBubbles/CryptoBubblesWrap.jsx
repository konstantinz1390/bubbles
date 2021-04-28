import { getBubbleSizeList } from '../../components/CryptoBubbles/cryptoHelper';
import _isEmpty from 'lodash/isEmpty';
import CryptoBubbles from '../../components/CryptoBubbles/CryptoBubbles';
import React from 'react';
import './CryptoBubbles.scss'
import { PlatformHelper } from '../../platform';

export const NO_DATA_VALUE = '-';

const CryptoBubblesWrap = ({ openDeals, quotesSettings, quotes }) => {
    const pipsList = !_isEmpty(openDeals) && !_isEmpty(quotes) && !_isEmpty(quotesSettings) ? Object.values(openDeals).map(deal => {
        const getDealPnl = () => {
            let pnl = PlatformHelper.getPnl(quotes[deal.security], deal, quotesSettings[deal.security]);
            pnl = (isNaN(pnl) || pnl === undefined) ? NO_DATA_VALUE : parseFloat(pnl).toFixed(2);
            return pnl;
        };
        return { ...deal, pnl: getDealPnl(), instrumentName: quotesSettings[deal.security].name };
    }) : null;
    const dealsWithBubbleSize = pipsList && getBubbleSizeList(pipsList);
    return <div className="st-crypto-bubbles">{ dealsWithBubbleSize ? <CryptoBubbles deals={dealsWithBubbleSize} /> : null }</div>;
};

export default CryptoBubblesWrap;
