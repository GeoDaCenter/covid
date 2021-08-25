const workboxBuild = require('workbox-build');
// NOTE: This should be run *AFTER* all your assets are built
const buildSW = () => {
  // This will return a Promise
  return workboxBuild.injectManifest({
    swSrc: 'src/sw.js', // this is your sw template file
    swDest: 'build/sw.js', // this will be created in the build step
    globDirectory: 'build',
    maximumFileSizeToCacheInBytes: 5000000,
    globPatterns: [
      // '**\/{csv,pbf,geojson}/{county_usfacts,covid_confirmed_usafacts}.{csv,pbf,geojson}',
      '**\/{csv,pbf,geojson}/{county_usfacts}.{geojson}',
      '**\/static/{js,css}/*.{css,js,map}',
      '**\/workers/*.{js}',
      'index.html'
    ]
  }).then(({count, size, warnings}) => {
    // Optionally, log any warnings and details.
    // warnings.forEach(console.warn);
    // console.log(`${count} files will be precached, totaling ${size} bytes.`);
  });
}
buildSW();  