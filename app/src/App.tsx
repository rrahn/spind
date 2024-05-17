import React from 'react';
import ReactDOM from 'react-dom';

const App: React.FC = () => {
  return (
    <div>
      <h1>Hello, World!</h1>
      <p>This is my first paragraph</p>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
