exports.RFC3339ToUTC = function (RFC339Time) {
  return Date.parse(RFC339Time);
};
exports.convertToRFC339 = function (date) {
  function ISODateString (d) {
    function pad (n) { return n < 10 ? '0' + n : n; }
    return d.getUTCFullYear() +
    '-' + pad(d.getUTCMonth() + 1) +
    '-' + pad(d.getUTCDate()) +
    'T' + pad(d.getUTCHours()) +
    ':' + pad(d.getUTCMinutes()) +
    ':' + pad(d.getUTCSeconds()) + 
    '+' + '00:00'; //Timezone offset:
     //Since user is choosing time presumably in their timezone setting the offset to always be 0.
  }
  return ISODateString(date);
};