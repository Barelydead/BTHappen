cat salar.csv | head -2 | tail -1 > head.csv

# clear output file
echo "" > salar.json

while IFS=, read col1 col2 col3 col4 col5 col6 col7 col8 col9
do
    echo -e "{
        \"$col1\":
        \"$col2\":
        \"$col3\":
        \"$col4\":
        \"$col5\":
        \"$col6\":
        \"$col7\":
        \"$col8\":
        \"$col9\":
}," | tr '\r' '"' > doc.txt
done < head.csv


# remove 2 first lines of salar.csv
cat salar.csv | tail -n +3 > rooms.csv


# add stuff before loop
echo -e "{
    \"salar\": [" > salar.json

while IFS=, read col1 col2 col3 col4 col5 col6 col7 col8 col9
do
    counter=0
    while IFS=n read line
    do

        case "$counter" in
        1)
            row=$col1
            ;;
        2)
            row=$col2
            ;;
        3)
            row=$col3
            ;;
        4)
            row=$col4
            ;;
        5)
            row=$col5
            ;;
        6)
            row=$col6
            ;;
        7)
            row=$col7
            ;;
        8)
            row=$col8
            ;;
        9)
            row=$(echo "$col9" | tr -d '\r')
            ;;

        esac

        if [ "$row" == "" ];
        then
            row=null
        else
            row=\"$row\"
        fi



        if [ "$counter" == 0 ];
        then
            echo -e "       $line" >> salar.json
        elif [ "$counter" == 10 ];
        then
            echo -e "       $line" >> salar.json
        elif [ "$counter" == 9 ];
        then
            echo -e "   $line $row" >> salar.json
        else
            echo -e "   $line $row," >> salar.json
        fi

        ((counter++))
    done < doc.txt

done < rooms.csv

# remove last "," from loop
sed -i '$ s/.$//' salar.json

# add stuff after loop
echo -e "   ]
}" >> salar.json

# remove temp files
rm doc.txt head.csv rooms.csv
