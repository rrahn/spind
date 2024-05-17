import React from 'react';
import ReactDOM from 'react-dom';
import LockerOrderForm from './components/LockerOrderForm';

const App: React.FC = () => {

  return (
    <div>
      <LockerOrderForm handleSubmit={() => console.log("Got some user data!")} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
