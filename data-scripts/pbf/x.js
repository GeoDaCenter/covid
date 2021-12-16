{
  const pbfResponse = await fetch('https://uscovidatlas.org/pbf/covid_confirmed_usafacts.pbf')
  let t0 = performance.now()
  const data = await pbfResponse.arrayBuffer().then(ab => {console.log('ab', t0-performance.now()); return new Pbf(ab)}).then(pbf => { console.log(' schema', t0-performance.now()); return Schemas.Rows.read(pbf)})   
  console.log('as schema', t0-performance.now(), data)
  return {
    format: 'pbf',
    time: performance.now() - t0,
    data,
  }

}