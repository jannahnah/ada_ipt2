const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/js/app.js', 'public/js') // Compiles app.js and its dependencies
    .react() // IMPORTANT: Enables Babel presets for React (.jsx and .js)
    .postCss('resources/css/app.css', 'public/css', [
        // Tailwind/PostCSS plugins can go here if needed
    ])
    .version(); // Adds version hashing for cache busting
