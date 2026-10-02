Kubernetes runs your apps on many machines for you. You describe what you want. It makes it happen and keeps it running.

Here are the parts:

- **Your wish.** You write a short file that says what to run and how many copies you want. This is called the desired state.
- **The front door.** A part called the API server receives every request. It checks each one and keeps a record.
- **The memory.** A reliable store called etcd remembers the plan. The plan survives even if machines fail.
- **The planner.** A part called the scheduler gives each piece of work a machine. It looks at free space and your rules.
- **The caretakers.** Parts called controllers watch all the time. If a copy crashes, they start a new one to close the gap.
- **The workers.** Each machine is called a node. An agent on it, the kubelet, starts the programs and reports back.
- **The packages.** The smallest package is called a pod. It is usually one running program plus its settings.
- **The steady address.** A Service gives many shifting copies one fixed address. Visitors use that address and never care which machine answers.

For example, you ask for three copies of your shop website. A copy crashes at night. A controller starts a replacement before morning, and shoppers notice nothing.
