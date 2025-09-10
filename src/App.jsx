import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CalendarModule from './modules/CalendarModule.jsx';
import EventDetailsPage from './pages/EventDetailsPage.jsx';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={CalendarModule} />
        <Route path="/events/:id" component={EventDetailsPage} />
      </Switch>
    </Router>
  );
}

export default App;