cur=`pwd`
workdir="/home/casper_test/"

cd $workdir

kill -9 `cat ${1}.pid`


cd $cur
