cur=`pwd`
workdir="/home/casper_test/"

cd $workdir

echo $$ > wangyi.pid
exec nohup casperjs wangyi2.js > wangyi.out


cd $cur
