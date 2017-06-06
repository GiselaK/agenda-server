exports.RFC3339ToUTC = function (RFC339Time) {
	return Date.parse(RFC339Time) 
}
exports.convertToRFC339 = function (date) {
	function ISODateString(d){
		function pad(n){return n<10 ? '0'+n : n}
		return d.getUTCFullYear()+'-'
		+ pad(d.getUTCMonth()+1)+'-'
		+ pad(d.getUTCDate())+'T'
		+ pad(d.getUTCHours())+':'
		+ pad(d.getUTCMinutes())+':'
		+ pad(d.getUTCSeconds())+'Z'
	}
	return ISODateString(date);
}