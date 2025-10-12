/**
 * First we will load all of this project's JavaScript dependencies which
 * includes React and other helpers. It's a great starting point while
 * building robust, powerful web applications using React + Laravel.
 */

require('./bootstrap');

/**
 * Next, we will create a fresh React component instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */


require('./components/Routers');

// resources/js/app.js (Example content)
require('./bootstrap'); 

import React from 'react';
import ReactDOM from 'react-dom';

import Student from './components/student.js'; 

// Check if the HTML element exists before mounting
if (document.getElementById('student-app')) {
    ReactDOM.render(<Student />, document.getElementById('student-app'));
}

