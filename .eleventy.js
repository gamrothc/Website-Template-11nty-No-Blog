// imports
const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const pluginDirectoryOutput = require("@11ty/eleventy-plugin-directory-output");
const pluginSitemap = require("@quasibit/eleventy-plugin-sitemap");
const pluginCritical = require("eleventy-critical-css");
const pluginImage = require("eleventy-plugin-img2picture");


// Config Imports
const configSitemap = require("./src/config/plugins/sitemap");
const configCritical = require("./src/config/plugins/critical");
const configImage = require("./src/config/plugins/image");
const configCss = require("./src/config/eleventy/css");
const configJs = require("./src/config/eleventy/javascript");

const { DateTime } = require('luxon');

const isProduction = process.env.NETLIFY;

module.exports = function (eleventyConfig) {
	// adds the official eleventy navigation plugin for a scalable navigation
	eleventyConfig.addPlugin(eleventyNavigationPlugin);

    // Provides benchmarks in the terminal when a website is built. Useful for diagnostics.
    // https://www.11ty.dev/docs/plugins/directory-output/
    eleventyConfig.addPlugin(pluginDirectoryOutput);

    // Automatically generates a sitemap based on the HTML files being generated
    // https://github.com/quasibit/eleventy-plugin-sitemap
    eleventyConfig.addPlugin(pluginSitemap, configSitemap);

    // Converts <img> tags to responsive <picture>s. An opt-in feature. Please read config/plugins/image.js to find out more
    // https://github.com/saneef/eleventy-plugin-img2picture
    eleventyConfig.addPlugin(pluginImage, configImage)

    // Production only plugins. Only run when "npm run build" is used.
    if (isProduction) {
        // Minify all HTML, CSS, JSON, XML, XSL and webmanifest files. Keeps comments when developing and removes them when live, for a smaller filesize
        // https://github.com/benjaminrancourt/eleventy-plugin-files-minifier
        eleventyConfig.addPlugin(pluginMinifier);

        // Inlines any critical CSS that's above the fold on a 1080p display. Increases build times by 2s-3s, so only ran in prod.
        // https://github.com/gregives/eleventy-critical-css
        eleventyConfig.addPlugin(pluginCritical, configCritical);
    }

	// Inlines any critical CSS that's above the fold on a 1080p display. Increases build times by 2s-3s, so only ran in prod.
	// https://github.com/gregives/eleventy-critical-css
	eleventyConfig.addPlugin(pluginCritical, configCritical);

	// allows assets, CMS files and other root files to be passed into /public. styles are automatically generated by LESS/SASS

	// Add each folder since css and js needs to be added separately for optimization
    eleventyConfig.addPassthroughCopy("./src/assets/favicons");
    eleventyConfig.addPassthroughCopy("./src/assets/fonts");
    eleventyConfig.addPassthroughCopy("./src/assets/images");
	eleventyConfig.addPassthroughCopy("./src/assets/svgs");

	// The optimization plugin will take care of copying the css and js so this is commented just for reference
	// eleventyConfig.addPassthroughCopy("./src/assets/css");
	// eleventyConfig.addPassthroughCopy("./src/assets/js"); 


	eleventyConfig.addPassthroughCopy('./src/admin');
	eleventyConfig.addPassthroughCopy('./src/_redirects');
	eleventyConfig.addPassthroughCopy({ './src/robots.txt': '/robots.txt' });
	eleventyConfig.addPassthroughCopy({ './src/sitemap.xml': '/sitemap.xml' });


    eleventyConfig.addTemplateFormats("css");
    eleventyConfig.addExtension("css", configCss);

    eleventyConfig.addTemplateFormats("js");
    eleventyConfig.addExtension("js", configJs);


	// normally, 11ty will render dates on blog posts in full JSDate format (Fri Dec 02 18:00:00 GMT-0600)
	// this filter allows dates to be converted into a normal, locale format. view the docs to learn more (https://moment.github.io/luxon/api-docs/index.html#datetime)
	eleventyConfig.addFilter('postDate', (dateObj) => {
		return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
	});

	return {
		dir: {
			input: 'src',
			output: 'public',
			includes: '_includes',
			data: '_data',
		},
		htmlTemplateEngine: 'njk',
	};
};
