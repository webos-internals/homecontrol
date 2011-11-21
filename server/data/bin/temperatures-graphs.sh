#!/bin/bash

	function graph_database()
	{
		/usr/bin/rrdtool graph \
			./data/graphs/${1}_${2}.png \
	    -s -1${2} -t "${3} :: last ${2}" \
			-z -h 80 -w 600 -a "PNG" -v "degrees C" -E \
			"DEF:temp=./data/temperatures/${1}.rrd:temp:AVERAGE" \
			"DEF:min=./data/temperatures/${1}.rrd:temp:MIN" \
	    "DEF:max=./data/temperatures/${1}.rrd:temp:MAX" \
			"LINE1:min#FF3333" "LINE1:max#66FF33" \
			"LINE2:temp#0000FF:temp sensor ${3}\\:" \
			"GPRINT:temp:MIN:    Min\\: %6.1lf" \
			"GPRINT:temp:MAX:    Max\\: %6.1lf" \
			"GPRINT:temp:AVERAGE: Avg\\: %6.1lf" \
			"GPRINT:temp:LAST: Current\\: %6.1lf degrees C\\n" >/dev/null
	}

# The Main Function

	while [ ${#} -gt 0 ]; do
		SID=$(echo ${1} | cut -d ':' -f 1)
		SNAME=$(echo ${1} | cut -d ':' -f 2)

		echo "- Creating graphs for ${SID} sensor"

		graph_database ${SID} day ${SNAME}
		graph_database ${SID} week ${SNAME}
		graph_database ${SID} month ${SNAME}
		graph_database ${SID} year ${SNAME}

		shift
	done

	exit 0
