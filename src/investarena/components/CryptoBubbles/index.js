import { connect } from 'react-redux';
import CryptoBubbles from '../../components/CryptoBubbles/CryptoBubblesWrap';
import { getOpenDealsState } from '../../redux/selectors/dealsSelectors';
import { getQuotesSettingsState } from '../../redux/selectors/quotesSettingsSelectors';
import { getQuotesState } from '../../redux/selectors/quotesSelectors';
import PropTypes from 'prop-types';

const propTypes = { openDeals: PropTypes.objectOf(PropTypes.shape({})).isRequired };

CryptoBubbles.propTypes = propTypes;

const mapStateToProps = (state) => ({
    openDeals: getOpenDealsState(state),
    quotesSettings: getQuotesSettingsState(state),
    quotes: getQuotesState(state),
});

export default connect(mapStateToProps)(CryptoBubbles);
