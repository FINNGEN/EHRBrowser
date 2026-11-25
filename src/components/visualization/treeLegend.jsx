import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import collapsedSvg from '../../img/legend-collapsed.svg';
import expandedSvg from '../../img/legend-expanded.svg';

export default function TreeLegend() {
  const [open, setOpen] = useState(false);
  return (
    <div id="tree-legend" className={open ? 'open' : ''} onClick={() => setOpen(o => !o)}>
      <img className="tl-content tl-expanded" src={expandedSvg} alt="Legend" draggable={false} />
      <img className="tl-content tl-collapsed" src={collapsedSvg} alt="Legend" draggable={false} />
      <span className="tl-caret">
        <FontAwesomeIcon className="iconLg" icon={open ? faCaretUp : faCaretDown} />
      </span>
    </div>
  );
}