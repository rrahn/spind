import '../main.css';
import React, { useState, useEffect, useRef } from 'react';

const COLUMN_KEY = {
    Name: 'Name',
    Forname: 'Vorname',
    Grade: 'Klasse',
};
  

function AddCheckBox(rowId, selected, handleSelectSingle) {
    return (
        <>
        <input type='checkbox' 
               className='select-single' 
               id='selectSingle_${rowId}' 
               checked={selected} 
               onChange={() => handleSelectSingle(rowId)}/>
        <label htmlFor='selectSingle_${rowId}'></label>
        </>
    );
}

function AddColumnHead(key, orders, setOrders) {
    
    function sortElements() {
        let text = event.target.textContent;
        switch (text.substring(0, text.search(' '))) {
            case 'Name': 
                setOrders(entries.toSorted((a, b) => {
                    if (nameOrderAscending)
                        return b.name.localeCompare(a.name);
                    else 
                        return a.name.localeCompare(b.name);
                }));
                setNameOrderAscending(!nameOrderAscending);
                break;
            case 'Vorname': 
                setOrders(entries.toSorted((a, b) => {
                    if (fornameOrderAscending)
                        return b.forename.localeCompare(a.forename);
                    else 
                        return a.forename.localeCompare(b.forename);
                }));
                setFornameOrderAscending(!fornameOrderAscending);
                break;
            case 'Klasse': 
                setOrders(entries.toSorted((a, b) => {
                    if (gradeOrderAscending)
                        return b.forename.localeCompare(a.forename);
                    else 
                        return a.forename.localeCompare(b.forename);
                }));
                setGradeOrderAscending(!gradeOrderAscending);
                break;
            default: return entries;
        }
    }
    
    return (
        <th onClick={sortElements}>{COLUMN_KEY.get(key)}</th>
    );
}

export default function OrderView() {

    // Add state hook and load it from backend
    // Display warning for incomplete entries
        // incomplete if: missing names or not enough money 
        // show details of entries while hovering over them: what is missing, 
        // what action do you want when incomplete
        // Incomplete entries won't get any information
    const entries = [
        {
            'name': 'Mustermann',
            'forename': 'Max',
            'grade': '7N',
            'value': '30 €',
            'payed': '20.06.2023',
            'selected': false,
        },
        {
            'name': 'Plustermann',
            'forename': 'Anna',
            'grade': '9A',
            'value': '30 €',
            'payed': '03.07.2023',
            'selected': false,
        },
    ];
    
    const [orders, setOrders] = useState(entries);
    const [nameOrderAscending, setNameOrderAscending] = useState(true);
    const [fornameOrderAscending, setFornameOrderAscending] = useState(true);
    const [gradeOrderAscending, setGradeOrderAscending] = useState(true);
    const checkboxRef = useRef();

    function countSelected() { 
        return orders.filter((order) => order.selected === true).length;
    }
    
    useEffect(() => {
        let count = countSelected();
        checkboxRef.current.checked = count === orders.length;
        checkboxRef.current.indeterminate = count > 0 && count < orders.length;
      }, [orders]);

    function handleSelectAll(event) {
        setOrders(orders.map((order) => {
            order.selected = event.target.checked;
            return order;
        }));
    }

    function handleSelectSingle(idx) {
        let changedOrder = orders[idx]; 
        changedOrder.selected = !changedOrder.selected;
        setOrders([
            ...orders.slice(0, idx),
            changedOrder,
            ...orders.slice(idx + 1)
        ]);
    }

    function sortElementsBy(event) {
        let text = event.target.textContent;
        switch (text.substring(0, text.search(' '))) {
            case 'Name': 
                setOrders(entries.toSorted((a, b) => {
                    if (nameOrderAscending)
                        return b.name.localeCompare(a.name);
                    else 
                        return a.name.localeCompare(b.name);
                }));
                setNameOrderAscending(!nameOrderAscending);
                break;
            case 'Vorname': 
                setOrders(entries.toSorted((a, b) => {
                    if (fornameOrderAscending)
                        return b.forename.localeCompare(a.forename);
                    else 
                        return a.forename.localeCompare(b.forename);
                }));
                setFornameOrderAscending(!fornameOrderAscending);
                break;
            case 'Klasse': 
                setOrders(entries.toSorted((a, b) => {
                    if (gradeOrderAscending)
                        return b.forename.localeCompare(a.forename);
                    else 
                        return a.forename.localeCompare(b.forename);
                }));
                setGradeOrderAscending(!gradeOrderAscending);
                break;
            default: return entries;
        }
    }

    const rows = orders.map((order, idx) => AddOrderRow(idx, order, handleSelectSingle));

    return (
        <div className='table-container'>
            <table>
                <tbody>
                    <tr key='0'>
                        <th><label><input 
                                        type="checkbox" 
                                        className="select-all"
                                        ref={checkboxRef}
                                        onChange={(event) => { handleSelectAll(event)}}/>
                            </label>
                        </th>
                        <th onClick={(event) => { sortElementsBy(event); }}>Name {nameOrderAscending ? '↑' : '↓'}</th>
                        <th onClick={(event) => { sortElementsBy(event); }}>Vorname {fornameOrderAscending ? '↑' : '↓'}</th>
                        <th onClick={(event) => { sortElementsBy(event); }}>Klasse {gradeOrderAscending ? '↑' : '↓'}</th>
                        <th>Betrag</th>
                        <th>Bezahlt am</th>
                    </tr>
                    {rows}
                </tbody>
            </table>

        </div>
    );
}

function AddOrderRow(idx, order, handleSelectSingle) {
    return ( 
        <tr key={idx + 1}>
            <td>{AddCheckBox(idx, order.selected, handleSelectSingle)}</td>
            <td>{order.name}</td>
            <td>{order.forename}</td>
            <td>{order.grade}</td>
            <td>{order.value}</td>
            <td>{order.payed}</td>
        </tr>
    );
}
