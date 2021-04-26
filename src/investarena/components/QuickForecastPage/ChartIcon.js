import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';

import ChartCaller from './ChartCaller';

const ChartIcon = props => {
  const [isOpen, setIsModalOpen] = useState(false);

  return (
    <button className="graphic" onClick={() => setIsModalOpen(true)}>
      <Icon type="bar-chart" />
      {isOpen && <ChartCaller id={props.id} isModalOpen={isOpen} setOpen={setIsModalOpen} />}
    </button>
  );
};

ChartIcon.propTypes = {
  id: PropTypes.string.isRequired,
};

export default ChartIcon;
