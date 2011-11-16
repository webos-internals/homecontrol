#!/bin/bash

	read_temperature()
	{
		TEMPERATURE=$(grep " t=" ${1} | sed s/".*t="/""/)

		echo "scale=3; ${TEMPERATURE} / 1000" | bc
	}

	function create_database()
	{
		/usr/bin/rrdtool create \
			./data/sensors/${1}.rrd \
			-s 300 \
			"DS:temp:GAUGE:600:U:U" \
			"RRA:AVERAGE:0.5:1:2016" \
			"RRA:MIN:0.5:1:2016" \
			"RRA:MAX:0.5:1:2016" \
			"RRA:AVERAGE:0.5:6:1344" \
			"RRA:MIN:0.5:6:1344" \
			"RRA:MAX:0.5:6:1344" \
			"RRA:AVERAGE:0.5:24:2190" \
			"RRA:MIN:0.5:24:2190" \
			"RRA:MAX:0.5:24:2190" \
			"RRA:AVERAGE:0.5:144:3650" \
			"RRA:MIN:0.5:144:3650" \
			"RRA:MAX:0.5:144:3650"
	}

	function update_database()
	{
		/usr/bin/rrdtool update \
			./data/sensors/${1}.rrd \
			-t "temp" N:${2}
	}

# The Main Function

	for SPATH in $(ls /sys/bus/w1/drivers/w1_slave_driver/*/w1_slave) ; do
		SID=$(basename $(dirname ${SPATH}))

		if [ ! -e ./data/sensors/${SID}.rrd ]; then
			echo "- Creating database for ${SID} sensor"

			create_database ${SID}
		fi

		echo "- Reading temperature for ${SID} sensor"

		T="$(read_temperature ${SPATH})"

		echo "- Reading of ${SID} sensor: ${T}"

		echo "- Updating database for ${SID} sensor"

		update_database ${SID} ${T}
	done

	exit 0
