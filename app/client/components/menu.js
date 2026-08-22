import './menu.css'
import React from 'react';
import { Link } from 'react-router-dom';

export function Menu() {
    return (
        <nav className='navigation'>
            <div className='navigation-menu'>
                <ul>
                    <li><Link to={'/'}>Home</Link></li>
                    <li><Link to={'#file'}>File</Link></li>
                    <li><Link to={'/lockers'}>Lockers</Link></li>
                    <li><Link to={'/orders'}>Orders</Link></li>
                </ul>
            </div>
        </nav>
    );
}