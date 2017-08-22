cur=`pwd`
workdir="/home/casper_test/"

cd $workdir

echo $$ > sina.pid
exec nohup casperjs sina2.js > sina.out


cd $cur
