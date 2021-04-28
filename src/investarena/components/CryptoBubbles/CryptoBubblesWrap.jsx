import { getBubbleSizeList, getPips } from '../../components/CryptoBubbles/cryptoHelper';
import _isEmpty from 'lodash/isEmpty';
import CryptoBubbles from '../../components/CryptoBubbles/CryptoBubbles';
import React from 'react';
import './CryptoBubbles.scss'

const CryptoBubblesWrap = ({ openDeals, quotesSettings, quotes }) => {
    const pipsList = !_isEmpty(openDeals) && !_isEmpty(quotes) && !_isEmpty(quotesSettings) ? Object.values(openDeals).map(deal => {
        const dealPips = getPips(deal, quotesSettings[deal.security], quotes[deal.security]);
        return { ...deal, pips: dealPips, instrumentName: quotesSettings[deal.security].name };
    }) : null;
    const dealsWithBubbleSize = pipsList && getBubbleSizeList(pipsList);
    return <div className="st-crypto-bubbles">{ dealsWithBubbleSize ? <CryptoBubbles deals={dealsWithBubbleSize} /> : null }</div>;
};

export default CryptoBubblesWrap;
