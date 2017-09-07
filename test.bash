# PORT
PORT=1337
if [[ $LINUX_PORT ]]; then
    PORT=$LINUX_PORT
fi

# SERVER
SERVER=localhost
if [[ $LINUX_SERVER ]]; then
    PORT=$LINUX_SERVER
fi

URL="$SERVER:$PORT"

develop="false"


function runTest
{
    declare -a arr=("/"
                    "/room/list"
                    "/room/view/house/h-huset"
                    "/room/view/house/c-huset"
                    "/room/view/house/a-huset"
                    "/room/view/search/video"
                    "/room/view/search/grupprum"
                    "/room/view/search/sal"
                    "/room/view/search/12"
                    "/room/view/id/G319-A"
                    "/room/view/id/G319-C"
                    "/room/view/id/H478"
                    "/room/view/searchp/Charles"
                    "/room/view/searchp/övning"
                    "/room/view/searchp/5"
                    "/404/ThisisError/searchp/5")



    if [ "$develop" == "false" ]
    then
        for thisRoute in "${arr[@]}"
        do
            echo -e "\n\nTesting route: $thisRoute"
            curl -i -g -s "$URL$thisRoute" | head -2
        done
    else
        for thisRoute in "/room/list" "/room/view/search/h"
        do
            echo -e "\n\nTesting: $thisRoute\n"
            curl -i -g -s "$URL$thisRoute"
        done
    fi
}

function badUsage
{
    echo "valid flags is --develop"
}



#
# Process options
#
while (( $# ))
do
    case "$1" in
        --develop)
            develop="true"
            runTest
            exit 0
        ;;

        *)
            badUsage "Option/command not recognized."
            exit 1
        ;;

    esac
done

runTest
exit 0
