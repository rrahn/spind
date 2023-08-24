// Maybe use css grid style?
// Here we define the  workbench of the application!
// We just generate the components and not the functionality
// This is the prototype for the actual tool!

function App() {
    const { Container, Row, Col } = ReactBootstrap;
    return (
        <Container>
            <Row>
                <Col md={{ offset: 3, span: 6 }}>
                    <LockerList />
                </Col>
            </Row>
        </Container>
    );
}

function LockerList() {
    const [lockers, setLockers] = React.useState(null);

    React.useEffect(() => {
        fetch('/lockers')
            .then(response => response.json())
            .then(setLockers);
    }, []);

    const onNewLocker = React.useCallback(
        (newLockers) => {
            console.log("Input: ", newLockers);
            console.log("Before: ", lockers);
            setLockers([...lockers, ...newLockers]);
            console.log("After: ", lockers);
        },
        [lockers],
    );

    const onLockerUpdate = React.useCallback(
        (locker) => {
            const index = lockers.findIndex(i => i.id === locker.id);
            setLockers([
                ...lockers.slice(0, index),
                locker,
                ...lockers.slice(index + 1),
            ]);
        },
        [lockers],
    );

    const onLockerRemoval = React.useCallback(
        locker => {
            const index = lockers.findIndex(idx => idx.id === locker.id);
            setLockers([...lockers.slice(0, index), ...lockers.slice(index + 1)]);
        },
        [lockers],
    );

    if (lockers === null) return 'Loading...';

    return (
        <React.Fragment>
            <AddLockerForm onNewLocker={onNewLocker}/>
            <p className="text-center">There are {lockers.length} lockers registered!</p>
            { lockers.map((locker) => (
                <LockerDisplay
                    locker={locker}
                    onLockerUpdate={onLockerUpdate}
                    onLockerRemoval={onLockerRemoval}
                />
            ))}
        </React.Fragment>
    );
}

function createLockerPostBody(boxNum, lockerLocation, lockerType) {
    return JSON.stringify({
        locker_num: 0,
        box_num: boxNum,
        location: lockerLocation,
        assignedTo: 0,
        status: 'free',
        type: lockerType,
    });
}

function AddLockerForm( {onNewLocker} ) {
    const { Form, Button } = ReactBootstrap;

    const [submitting, setSubmitting] = React.useState(false);
    const [boxCount, setBoxCount] = React.useState(0);
    const [lockerType, setLockerType] = React.useState(null);
    const [lockerLocation, setLockerLocation] = React.useState(0);

    const submitNewLocker = (event) => {
        event.preventDefault();
        setSubmitting(true);
        console.log("Submitted the form!");
        console.log(boxCount);
        console.log(lockerType);
        console.log(lockerLocation);

        const requests = Array.from({ length: boxCount }, (value, index) => {
            return createLockerPostBody(index + 1, lockerLocation, lockerType);
        }).map(lockerBody => {
            return fetch('/lockers', {
                method: 'POST',
                body: lockerBody,
                headers: { 'Content-Type': 'application/json'},
            });
        });
        console.log(requests);
        Promise.all(requests)
            .then((responses) => responses.map((r) => r.json()))
            .then((lockerPromises) => {
                Promise.all(lockerPromises)
                    .then((lockers) => {
                        console.log(lockers);
                        onNewLocker(lockers);
                    });
                setLockerType(null);
                setBoxCount(0);
                setLockerLocation(0);
                setSubmitting(false);
            });
    };

    return (
        <React.Fragment>
            <Form onSubmit={submitNewLocker}>
                <Form.Group className="mb-3" controlId="formBoxCount">
                    <Form.Label>Number of boxes</Form.Label>
                    <Form.Control
                        type='number'
                        placeholder='0'
                        value={boxCount}
                        onChange={event => setBoxCount(event.target.value) }
                    />
                    <Form.Text className="text-muted">
                        Enter the number of boxes.
                    </Form.Text>
                </Form.Group>
                <Form.Check // prettier-ignore
                    type={'radio'}
                    name='formAddLockerCheck'
                    id='formAddLockerWithKey'
                    label='has key'
                    value='key'
                    onClick={event => setLockerType(event.target.value)}
                />
                <Form.Check // prettier-ignore
                    type={'radio'}
                    name='formAddLockerCheck'
                    id='formAddLockerWithNumpad'
                    label='has numpad'
                    value='numpad'
                    onClick={event => setLockerType(event.target.value)}
                />
                <Form.Group className="mb-3" controlId="formAddLockerLocation">
                    <Form.Label>Which story?</Form.Label>
                    <Form.Control
                        type='number'
                        placeholder='0'
                        min='-1'
                        max='3'
                        value={lockerLocation}
                        onChange={event => setLockerLocation(event.target.value) }
                    />
                </Form.Group>
                <Button
                    type='submit'
                    variant='success'
                    disabled={!lockerType || submitting}
                >
                    {submitting ? 'Adding...' : 'Add'}
                </Button>
            </Form>
            <p>This locker has {boxCount} boxes.</p>
        </React.Fragment>
    );
}

function LockerDisplay({locker, onLockerUpdate, onLockerRemoval }) {
    const { Container, Row, Col, Button } = ReactBootstrap;

    // const toggleCompletion = () => {
    //     fetch(`/lockers/${locker.id}`, {
    //         method: 'PUT',
    //         body: JSON.stringify({
    //             name: locker.name,
    //             completed: !locker.completed,
    //         }),
    //         headers: { 'Content-Type': 'application/json' },
    //     })
    //         .then(r => r.json())
    //         .then(onLockerUpdate);
    // };

    const removeLocker = () => {
        fetch(`/lockers/${locker.id}`, { method: 'DELETE' }).then(() =>
            onLockerRemoval(locker),
        );
    };

    return (
        <Container fluid className='locker'>
            <Row>
                <Col xs={2} className='name'>
                    n: {locker.locker_num}
                </Col>
                <Col xs={2} className='name'>
                    b: {locker.box_num}
                </Col>
                <Col xs={2} className='name'>
                    l: {locker.location}
                </Col>
                <Col xs={1}>
                    <Button
                        size="sm"
                        variant="link"
                        onClick={removeLocker}
                        aria-label="Remove Locker"
                    >
                        <i className="fa fa-trash text-danger" />
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

function TodoListCard() {
    const [items, setItems] = React.useState(null); // state hook

    React.useEffect(() => {  // rendering hook whenever component is updated
        fetch('/items')
            .then(r => r.json())
            .then(setItems);
    }, []);

    const onNewItem = React.useCallback(
        newItem => {
            setItems([...items, newItem]);
        },
        [items],
    );

    const onItemUpdate = React.useCallback(
        item => {
            const index = items.findIndex(i => i.id === item.id);
            setItems([
                ...items.slice(0, index),
                item,
                ...items.slice(index + 1),
            ]);
        },
        [items],
    );

    const onItemRemoval = React.useCallback(
        item => {
            const index = items.findIndex(i => i.id === item.id);
            setItems([...items.slice(0, index), ...items.slice(index + 1)]);
        },
        [items],
    );

    if (items === null) return 'Loading...';

    return (
        // Fragment to run multiple statements as single object?
        <React.Fragment>
            <AddItemForm onNewItem={onNewItem} />
            {items.length === 0 && (
                <p className="text-center">You have no todo items yet! Add one above!</p>
            )}
            {items.map(item => (
                <ItemDisplay
                    item={item}
                    key={item.id}
                    onItemUpdate={onItemUpdate}
                    onItemRemoval={onItemRemoval}
                />
            ))}
        </React.Fragment>
    );
}

function AddItemForm({ onNewItem }) {
    const { Form, InputGroup, Button } = ReactBootstrap;

    const [newItem, setNewItem] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    const submitNewItem = e => {
        e.preventDefault();
        setSubmitting(true);
        fetch('/items', {
            method: 'POST',
            body: JSON.stringify({ name: newItem }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(item => {
                onNewItem(item);
                setSubmitting(false);
                setNewItem('');
            });
    };

    return (
        <Form onSubmit={submitNewItem}>
            <InputGroup className="mb-3">
                <Form.Control
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    type="text"
                    placeholder="New Item"
                    aria-describedby="basic-addon1"
                />
                <InputGroup.Append>
                    <Button
                        type="submit"
                        variant="success"
                        disabled={!newItem.length}
                        className={submitting ? 'disabled' : ''}
                    >
                        {submitting ? 'Adding...' : 'Add'}
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
    );
}

function ItemDisplay({ item, onItemUpdate, onItemRemoval }) {
    const { Container, Row, Col, Button } = ReactBootstrap;

    const toggleCompletion = () => {
        fetch(`/items/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: item.name,
                completed: !item.completed,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(onItemUpdate);
    };

    const removeItem = () => {
        fetch(`/items/${item.id}`, { method: 'DELETE' }).then(() =>
            onItemRemoval(item),
        );
    };

    return (
        <Container fluid className={`item ${item.completed && 'completed'}`}>
            <Row>
                <Col xs={1} className="text-center">
                    <Button
                        className="toggles"
                        size="sm"
                        variant="link"
                        onClick={toggleCompletion}
                        aria-label={
                            item.completed
                                ? 'Mark item as incomplete'
                                : 'Mark item as complete'
                        }
                    >
                        <i
                            className={`far ${
                                item.completed ? 'fa-check-square' : 'fa-square'
                            }`}
                        />
                    </Button>
                </Col>
                <Col xs={10} className="name">
                    {item.name}
                </Col>
                <Col xs={1} className="text-center remove">
                    <Button
                        size="sm"
                        variant="link"
                        onClick={removeItem}
                        aria-label="Remove Item"
                    >
                        <i className="fa fa-trash text-danger" />
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

// ReactDOM.render(<App />, document.getElementById('root'));
