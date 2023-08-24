import React from 'react';
import { Outlet } from 'react-router-dom';

export default function Workbench() {
    return (
        <div>
            <h1>Workbench</h1> 
            <div id='detail'>
                <Outlet />
            </div>
        </div>
    );
}