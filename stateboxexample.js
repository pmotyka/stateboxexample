'use strict'

const Statebox = require('@wmfs/statebox')
const statebox = new Statebox({})

const main = async function () {

	await statebox.ready
	statebox.createModuleResources({
		add: class Add {
			run(event, context) {
				context.sendTaskSuccess(event.number1 + event.number2)
			}
		},
		subtract: class Subtract {
			init(resourceConfig, env, callback) {
				callback(null)
			}
			run(event, context) {
				context.sendTaskSuccess(event.number1 - event.number2)
			}
		}
	})
	await statebox.createStateMachines({
		'calculator': {
			Comment: 'A simple calculator',
			StartAt: 'OperatorChoice',
			States: {
				OperatorChoice: {
					Type: 'Choice',
					Choices: [{
						Variable: '$.operator',
						StringEquals: '+',
						Next: 'Add'
					},
					{
						Variable: '$.operator',
						StringEquals: '-',
						Next: 'Subtract'
					}
					]
				},
				Add: {
					Type: 'Task',
					InputPath: '$.numbers',
					Resource: 'module:add',
					ResultPath: '$.result',
					End: true
				},
				Subtract: {
					Type: 'Task',
					InputPath: '$.numbers',
					Resource: 'module:subtract',
					ResultPath: '$.result',
					End: true
				}
			}
		}
	})

	const executionDescription = await statebox.startExecution({
		numbers: {
			number1: 3,
			number2: 2
		},
		operator: '-'
	},
		'calculator',
		{}
	)
	
	const executionDescription2 = await statebox.waitUntilStoppedRunning(executionDescription.executionName)
	console.log(executionDescription2)
}

if (require.main === module) {
	main();
}