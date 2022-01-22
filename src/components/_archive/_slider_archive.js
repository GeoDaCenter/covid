

        
// <PlayPauseContainer item xs={1}>
// </PlayPauseContainer>
// )}
// <Grid container spacing={2}>
// {rangeType !== 'custom' && <DateTitle />}
// <Grid item xs={11}>
// {' '}
// {/* Sliders Grid Item */}
// {/* Main Slider for changing date */}
// {rangeType !== 'custom' && nType !== 'characteristic' && (
//   <LineSlider
//     id="timeSlider"
//     value={nIndex}
//     // valueLabelDisplay="on"
//     onChange={handleChange}
//     getAriaValueText={valuetext}
//     valueLabelFormat={valuetext}
//     aria-labelledby="aria-valuetext"
//     min={1}
//     max={dates.length}
//     step={1}
//     characteristic={nType === 'characteristic'}
//   />
// )}
// {/* Slider for bin date */}
// {/* {!customRange && 
//                 <BinSlider 
//                     value={dataParams.binIndex} 
//                     valueLabelDisplay="auto"
//                     onChange={handleBinChange} 
//                     getAriaValueText={binValuetext}
//                     valueLabelFormat={binValuetext}
//                     aria-labelledby="aria-valuetext"
//                     min={startDateIndex}
//                     step={1}
//                     max={startDateIndex+dates[currentData].length-1}
//             />} */}
// {/* Slider for changing date range */}
// {rangeType === 'custom' && (
//   <RangeSlider
//     id="timeSlider"
//     value={[nIndex - nRange, nIndex]}
//     valueLabelDisplay="on"
//     onChange={handleRangeChange}
//     getAriaValueText={(val) => valuetext(dates, val)}
//     valueLabelFormat={(val) => valuetext(dates, val)}
//     aria-labelledby="aria-valuetext"
//     min={1}
//     max={dates.length}
//     step={1}
//   />
// )}
// </Grid>
// {rangeType !== 'custom' && nType !== 'characteristic' && (
// <InitialDate>{valuetext(dates, 0)}</InitialDate>
// )}
// {rangeType !== 'custom' && nType !== 'characteristic' && (
// <EndDate>
//   {dateIndices !== undefined &&
//     valuetext(dates, [dateIndices.slice(-1)[0]])}
// </EndDate>
// )}
// {isTicking && (
// <SpeedSlider>
//   <p>Animation Speed</p>
//   <LineSlider
//     value={1000 - timing}
//     onChange={(e, newValue) => setTiming(1000 - newValue)}
//     getAriaValueText={speedtext}
//     valueLabelFormat={speedtext}
//     aria-labelledby="aria-valuetext"
//     min={25}
//     max={975}
//     step={25}
//   />
// </SpeedSlider>
// )}
// </Grid>