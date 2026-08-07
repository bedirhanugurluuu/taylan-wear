import {Link} from 'react-router';
import {TOP_BAR} from '~/lib/site-content';

export function TopBar() {
  const {left, right} = TOP_BAR;

  return (
    <div className="top-bar">
      <div className="top-bar__inner">
        <div className="top-bar__left">
          {left.href ? (
            <Link to={left.href} className="top-bar__link">
              {left.text}
            </Link>
          ) : (
            <span>{left.text}</span>
          )}
        </div>
        <div className="top-bar__right">
          {right.href ? (
            <Link to={right.href} className="top-bar__link">
              {right.text}
            </Link>
          ) : (
            <span>{right.text}</span>
          )}
        </div>
      </div>
    </div>
  );
}
