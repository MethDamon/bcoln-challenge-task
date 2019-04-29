import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import configureStore from './store/configureStore';
import {Provider} from 'react-redux';
import {BrowserRouter} from "react-router-dom";
import App from "./App";
import {CookiesProvider} from "react-cookie";
import { Web3Provider } from 'react-web3';

const store = configureStore();

ReactDOM.render(
    <Web3Provider>
        <CookiesProvider>
            <Provider store={store}>
                <BrowserRouter>
                    <App/>
                </BrowserRouter>
            </Provider>
        </CookiesProvider>
    </Web3Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
