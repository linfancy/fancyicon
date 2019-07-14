/* eslint-disable */
const { exec } = require('child_process');
const { CLIEngine } = require('eslint');
const chalk = require('chalk');

const cli = new CLIEngine({});

function getErrorLevel(number) {
  switch (number) {
	case 2:
	  return 'error';
	case 1:
	  return 'warn';
	default:
  }
  return 'undefined';
}

const chalkLevels = {
  error: chalk.red,
  warn: chalk.yellow,
};

let pass = 0;
console.log('checking eslint ...');
exec('git diff --cached --name-only | grep -E "\.js[x]?$"', (error, stdout) => {
  if (stdout.length) {
	// 把文件列表转为数组，并去掉最后的空行
	const array = stdout.split('\n');
	array.pop();

	const { results } = cli.executeOnFiles(array);
	let errorCount = 0;
	let warningCount = 0;
	results.forEach((result) => {
	  errorCount += result.errorCount;
	  warningCount += result.warningCount;

	  if (result.messages.length > 0) {
		console.log(`\n${result.filePath}`);
		result.messages.forEach(({
		  severity,
		  line,
		  column,
		  message,
		  ruleId,
		}) => {
		  const level = getErrorLevel(severity);
		  console.log(chalkLevels[level](`   ${result.filePath}:${line}:${column}  ${level}  ${message}  ${ruleId}`));
		  pass = 1;
		});
	  }
	});

	if (warningCount > 0 || errorCount > 0) {
	  console.log(`\n   ${errorCount + warningCount} problems (${errorCount} ${'errors'} ${warningCount} warnings)`);
	}
	process.exit(pass);
  }
  if (error !== null) {
	console.log('no js,jsx file commit, skip eslint check');
  }
});