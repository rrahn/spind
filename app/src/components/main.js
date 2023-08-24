import './main.css'

import React from 'react';
import { Menu } from './menu.js';
import Workbench from './workbench.js';
import { Outlet } from 'react-router-dom';

export default function Main() {
    return (
        <React.Fragment>
            <div>
                <h1>Header</h1>
            </div>
            <Menu />
            <Workbench />
            <div>
                <h1>Footer</h1> 
            </div>
        </React.Fragment>
    );
}
