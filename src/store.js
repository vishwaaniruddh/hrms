import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createBrowserHistory } from 'history';
import { routerReducer, routerMiddleware } from 'react-router-redux';

const history = createBrowserHistory();

const rootReducer = combineReducers({
  // Add your other reducers here
  router: routerReducer,
});

const middleware = routerMiddleware(history);

const store = createStore(rootReducer, applyMiddleware(middleware));

export { store, history };
