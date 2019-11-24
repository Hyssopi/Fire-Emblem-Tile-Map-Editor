
//import moment from '../lib/moment.js';


/**
 * Checks to see if input is a valid number.
 *
 * @param input Possible number
 * @return Whether the input is a valid number
 */
export function isNumeric(input)
{
  return !isNaN(parseFloat(input)) && isFinite(input);
}

/**
 * Get Moment date with UTC inputs.
 *
 * @param year Year
 * @param month Month ranging from 1 to 12
 * @param day Day
 * @param hours Hours
 * @param minutes Minutes
 * @param seconds Seconds
 * @param milliseconds Milliseconds
 * @return Moment date in UTC
 */
export function getMomentUtcDate(year, month, day, hours = 0, minutes = 0, seconds = 0, milliseconds = 0)
{
  let dateString = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + '.' + milliseconds + '+0000';
  return moment(dateString, "YYYY-MM-DDTHH:mm:ss.SSSZ").utc();
}

/**
 * Returns formatted number with comma in thousands places.
 *
 * @param number Number to be formatted
 * @return Formatted number with comma in thousands places
 */
export function thousandsCommaFormatNumber(number)
{
  let parts = number.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

/**
 * Returns formatted date in DD MMM YYYY format.
 *
 * @param date Date object or Moment date to be formatted
 * @return Formatted date
 */
export function getFormattedDate(date)
{
  return moment(date).format('DD MMM YYYY');
}

/**
 * Get the difference duration of two dates in "X years, Y months, Z days" format. date1 must be after date2.
 *
 * @param date1 Moment date, must be after date2
 * @param date2 Moment date to difference
 * @return String text difference duration of two dates in "X years, Y months, Z days" format
 */
export function getFormattedDateDifferenceDuration(date1, date2)
{
  let dateDifference = date1.diff(date2);
  let dateDifferenceDuration = moment.duration(dateDifference);
  
  let formattedDateDifferenceText = '';
  if (dateDifferenceDuration.years() > 0)
  {
    formattedDateDifferenceText += dateDifferenceDuration.years() + ' ';
    formattedDateDifferenceText += (dateDifferenceDuration.years() === 1) ? 'year' : 'years';
  }
  if (dateDifferenceDuration.months() > 0)
  {
    if (formattedDateDifferenceText)
    {
      formattedDateDifferenceText += ', ';
    }
    formattedDateDifferenceText += dateDifferenceDuration.months() + ' ';
    formattedDateDifferenceText += (dateDifferenceDuration.months() === 1) ? 'month' : 'months';
  }
  if (dateDifferenceDuration.days() > 0)
  {
    if (formattedDateDifferenceText)
    {
      formattedDateDifferenceText += ', ';
    }
    formattedDateDifferenceText += dateDifferenceDuration.days() + ' ';
    formattedDateDifferenceText += (dateDifferenceDuration.days() === 1) ? 'day' : 'days';
  }
  if (!formattedDateDifferenceText)
  {
    formattedDateDifferenceText = '0 days';
  }
  
  return formattedDateDifferenceText;
}

/**
 * Get current date in UTC as Moment date
 *
 * @return Current date in UTC as Moment date
 */
export function getMomentCurrentDateUTC()
{
  return moment().utc();
}

/**
 * Generate random integer between inclusive min and inclusive max.
 *
 * @param min Inclusive minimum
 * @param max Inclusive maximum
 * @return Random integer between inclusive min and inclusive max
 */
export function generateRandomInteger(min, max)
{
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Determine if random roll is successful.
 *
 * @param successRate Success rate from 1 to 100
 * @return Boolean whether the random roll is successful
 */
export function isRandomSuccess(successRate)
{
  return generateRandomInteger(1, 100) <= successRate;
}

/**
 * Get color RGBA values as color object with {r, g, b, a}.
 *
 * @param colorString Color in hex, RGB, or RGBA color string format: '#345678', '#357', 'rgb(52, 86, 120)', 'rgba(52, 86, 120, 0.67)'
 * @return Color object, {r: 52, g: 86, b: 120, a: 0.67}
 */
export function getRgbaValues(colorString)
{
  let _hexToDec = function(value)
  {
    return parseInt(value, 16)
  };
  
  let _splitHex = function(hex)
  {
    let hexCharacters;
    if (hex.length === 4)
    {
      // Example: '#357'
      hexCharacters = (hex.replace('#', '')).split('');
      return {
        r: _hexToDec((hexCharacters[0] + hexCharacters[0])),
        g: _hexToDec((hexCharacters[1] + hexCharacters[1])),
        b: _hexToDec((hexCharacters[2] + hexCharacters[2])),
        a: 1.0
      };
    }
    else
    {
      // Example: '#345678'
      return {
        r: _hexToDec(hex.slice(1, 3)),
        g: _hexToDec(hex.slice(3, 5)),
        b: _hexToDec(hex.slice(5)),
        a: 1.0
      };
    }
  };
  
  let _splitRgba = function(rgba)
  {
    // Example: 'rgb(52, 86, 120)', 'rgba(52, 86, 120, 0.67)'
    let rgbaValues = (rgba.slice(rgba.indexOf('(') + 1, rgba.indexOf(')'))).split(',');
    let hasAlpha = false;
    rgbaValues = rgbaValues.map(function(value, index)
    {
      if (index !== 3)
      {
        // r, g, b
        return parseInt(value, 10);
      }
      else
      {
        // a
        hasAlpha = true;
        return parseFloat(value);
      }
    });
    
    return {
      r: rgbaValues[0],
      g: rgbaValues[1],
      b: rgbaValues[2],
      a: hasAlpha ? rgbaValues[3] : 1.0
    };
  };
  
  let colorStringType = colorString.slice(0,1);
  if (colorStringType === '#')
  {
    return _splitHex(colorString);
  }
  else if (colorStringType.toLowerCase() === 'r')
  {
    return _splitRgba(colorString);
  }
  else
  {
    console.error('getRgbaValues(\'' + colorString + '\') is not hex, RGB, or RGBA color string');
  }
}

/**
 * Calculate average color of a list of colors.
 *
 * @param colors List of colors in hex, RGB, or RGBA color string format
 * @return Averaged color in RGBA color string format
 */
export function calculateAverageColor(colors)
{
  let colorRedSum = 0;
  let colorGreenSum = 0;
  let colorBlueSum = 0;
  let colorAlphaSum = 0;
  colors.forEach(function(colorString)
  {
    let colorObject = getRgbaValues(colorString);
    colorRedSum += colorObject.r;
    colorGreenSum += colorObject.g;
    colorBlueSum += colorObject.b;
    colorAlphaSum += colorObject.a;
  });
  colorRedSum /= colors.length;
  colorGreenSum /= colors.length;
  colorBlueSum /= colors.length;
  colorAlphaSum /= colors.length;
  return 'rgba(' + colorRedSum + ', ' + colorGreenSum + ', ' + colorBlueSum + ', ' + colorAlphaSum + ')';
}

/**
 * Get resulting string from replacing string at index with a substring.
 *
 * @param input Input string to based off
 * @param index Index of input string to begin replacing
 * @param replacement Substring used to replace
 * @return String resulted from replacing input string with substring at index
 */
export function stringReplaceAt(input, index, replacement)
{
  return input.substring(0, index) + replacement + input.substring(index + replacement.length);
}

/**
 * Get window width in pixel.
 *
 * @return Window width in pixel
 */
export function getWindowWidth()
{
  return isNaN(window.innerWidth) ? window.clientWidth : window.innerWidth;
}

/**
 * Get window height in pixel.
 *
 * @return Window height in pixel
 */
export function getWindowHeight()
{
  return isNaN(window.innerHeight) ? window.clientHeight : window.innerHeight;
}






//**********Add to main utilities.js***********//



export function isUrlExists(url)
{
  try
  {
    let http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status != 404;
  }
  catch(exception)
  {
    return false;
  }
}




export function copyTextToClipboard(text)
{
  let textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.textContent = text;
  document.body.appendChild(textArea);
  
  let selection = document.getSelection();
  let range = document.createRange();
  range.selectNode(textArea);
  selection.removeAllRanges();
  selection.addRange(range);
  
  document.execCommand('copy');
  
  selection.removeAllRanges();
  document.body.removeChild(textArea);
}







































