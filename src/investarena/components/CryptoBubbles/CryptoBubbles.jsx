import { BubblesCanvas } from '../../components/CryptoBubbles/BubbleConstructor';
import React, { useState } from 'react';
import _keyBy from 'lodash/keyBy';
import _isEqual from 'lodash/isEqual';

class CryptoBubbles extends React.Component {
    canvas = React.createRef();
    componentDidMount() {
        this.canvasBubbles = new BubblesCanvas(this.canvas.current, this.props.deals);
        this.canvasBubbles.start();
    }
    componentDidUpdate(prevProps) {
        if(!_isEqual(this.props.deals, prevProps.deals)) {
            console.log(this.props.deals);
            const deals = _keyBy(this.props.deals, 'dealId');
            this.canvasBubbles.updateDeals(deals);
        }
    }
    render() {
        return <canvas ref={this.canvas} height="720px" width="1168px"/>;
    }
}

export default CryptoBubbles;
