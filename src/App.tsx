import { useMemo, useState } from 'react';

type Agent = {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'done';
  focus: string;
};

type WorkflowStep = {
  name: string;
  description: string;
  agent: string;
};

type RunLog = {
  time: string;
  actor: string;
  action: string;
  detail: string;
};

const scenarios = [
  {
    id: 'campaign',
    name: '投放优化',
    summary: '多 Agent 协同完成活动诊断、文案优化、预算调整和复盘。',
  },
  {
    id: 'crm',
    name: '私域转化',
    summary: '围绕线索分层、自动触达、跟进提醒和流失预警形成闭环。',
  },
  {
    id: 'ops',
    name: '运营排障',
    summary: '多 Agent 分析告警、定位异常、生成处置建议并同步执行结果。',
  },
] as const;

const baseAgents: Agent[] = [
  { id: 'planner', name: '策略规划 Agent', role: '负责目标拆解与执行路线生成', status: 'idle', focus: '增长目标与优先级' },
  { id: 'analyst', name: '数据分析 Agent', role: '负责指标诊断、异常检测与归因', status: 'idle', focus: '漏斗、转化、波动' },
  { id: 'operator', name: '执行运营 Agent', role: '负责任务落地、内容更新与触达编排', status: 'idle', focus: '文案、触达、排期' },
  { id: 'reviewer', name: '审校风控 Agent', role: '负责结果审核、风险提示与回滚建议', status: 'idle', focus: '合规、异常、阈值' },
];

const workflow: WorkflowStep[] = [
  { name: '目标识别', description: '接收业务目标和约束，拆解为可执行任务。', agent: '策略规划 Agent' },
  { name: '信号分析', description: '读取数据波动、历史表现和当前风险。', agent: '数据分析 Agent' },
  { name: '协同执行', description: '生成内容、调整参数、下发动作。', agent: '执行运营 Agent' },
  { name: '审校闭环', description: '审核结果，输出回滚与复盘建议。', agent: '审校风控 Agent' },
];

const buildScenarioLogs = (scenario: string): RunLog[] => {
  const stamp = new Date();
  const timeline = [
    { actor: '系统', action: '接收任务', detail: `已进入 ${scenario} 场景，开始编排多 Agent 流程。` },
    { actor: '策略规划 Agent', action: '生成计划', detail: '拆解为诊断、执行、审核三段式工作流。' },
    { actor: '数据分析 Agent', action: '分析指标', detail: '识别关键波动点，补充需要重点关注的指标。' },
    { actor: '执行运营 Agent', action: '执行动作', detail: '同步更新策略建议并输出待执行清单。' },
    { actor: '审校风控 Agent', action: '完成复核', detail: '确认结果满足阈值并生成复盘建议。' },
  ];

  return timeline.map((entry, index) => {
    const time = new Date(stamp.getTime() + index * 1000).toLocaleTimeString('zh-CN', { hour12: false });
    return { time, ...entry };
  });
};

export default function App() {
  const [scenario, setScenario] = useState<(typeof scenarios)[number]['id']>('campaign');
  const [agents, setAgents] = useState(baseAgents);
  const [logs, setLogs] = useState<RunLog[]>(buildScenarioLogs('投放优化'));
  const [isRunning, setIsRunning] = useState(false);

  const selectedScenario = useMemo(() => scenarios.find((item) => item.id === scenario) ?? scenarios[0], [scenario]);

  const metrics = useMemo(
    () => [
      { label: '自动化覆盖率', value: '86%', delta: '+18%' },
      { label: '平均响应时长', value: '42s', delta: '-31%' },
      { label: '执行成功率', value: '97.4%', delta: '+6.8%' },
      { label: '异常拦截数', value: '28', delta: '+11' },
    ],
    [],
  );

  const runScenario = async () => {
    setIsRunning(true);
    setAgents((current) => current.map((agent) => ({ ...agent, status: 'working' })));
    setLogs(buildScenarioLogs(selectedScenario.name));

    const phases = [
      { agentId: 'planner', status: 'working' as const },
      { agentId: 'analyst', status: 'working' as const },
      { agentId: 'operator', status: 'working' as const },
      { agentId: 'reviewer', status: 'working' as const },
    ];

    for (const phase of phases) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      setAgents((current) =>
        current.map((agent) => (agent.id === phase.agentId ? { ...agent, status: 'done' } : agent)),
      );
      setLogs((current) => [
        ...current,
        {
          time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
          actor: '系统',
          action: '协同推进',
          detail: `已完成 ${phase.agentId} 阶段并自动推进到下一步。`,
        },
      ]);
    }

    setIsRunning(false);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Multi-Agent Ops</p>
          <h1>多 Agent 协同运营自动化系统</h1>
          <p className="sidebar-copy">
            用策略、分析、执行和审校四个 Agent 协同完成运营闭环，适合做项目展示、面试演示和方案验证。
          </p>
        </div>

        <div className="scenario-list">
          {scenarios.map((item) => (
            <button
              key={item.id}
              className={`scenario-card ${scenario === item.id ? 'active' : ''}`}
              onClick={() => {
                setScenario(item.id);
                setAgents(baseAgents.map((agent) => ({ ...agent, status: 'idle' })));
                setLogs(buildScenarioLogs(item.name));
              }}
            >
              <span>{item.name}</span>
              <small>{item.summary}</small>
            </button>
          ))}
        </div>

        <button className="primary-btn" onClick={runScenario} disabled={isRunning}>
          {isRunning ? '运行中...' : '启动协同编排'}
        </button>
      </aside>

      <main className="content">
        <section className="hero-card">
          <div>
            <p className="eyebrow">Workflow Control Center</p>
            <h2>{selectedScenario.name}</h2>
            <p>{selectedScenario.summary}</p>
          </div>
          <div className="hero-status">
            <span className={isRunning ? 'pulse live' : 'pulse'} />
            <strong>{isRunning ? '多 Agent 正在协同执行' : '待命中'}</strong>
            <span>支持任务拆解、协作执行、结果审核与复盘输出</span>
          </div>
        </section>

        <section className="metrics-grid">
          {metrics.map((metric) => (
            <article key={metric.label} className="metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.delta}</small>
            </article>
          ))}
        </section>

        <section className="workspace-grid">
          <article className="panel">
            <div className="panel-head">
              <h3>Agent 状态</h3>
              <span>4 个协同节点</span>
            </div>
            <div className="agent-list">
              {agents.map((agent) => (
                <div key={agent.id} className="agent-row">
                  <div>
                    <strong>{agent.name}</strong>
                    <p>{agent.role}</p>
                  </div>
                  <div className="agent-meta">
                    <span className={`status ${agent.status}`}>{agent.status === 'idle' ? '待命' : agent.status === 'working' ? '执行中' : '已完成'}</span>
                    <small>{agent.focus}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h3>协同流程</h3>
              <span>自动闭环</span>
            </div>
            <div className="workflow-rail">
              {workflow.map((step, index) => (
                <div key={step.name} className="workflow-step">
                  <span className="workflow-index">0{index + 1}</span>
                  <div>
                    <strong>{step.name}</strong>
                    <p>{step.description}</p>
                    <small>{step.agent}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="panel logs-panel">
          <div className="panel-head">
            <h3>执行日志</h3>
            <span>实时可追踪</span>
          </div>
          <div className="logs-list">
            {logs.map((log, index) => (
              <div key={`${log.time}-${index}`} className="log-row">
                <span className="log-time">{log.time}</span>
                <div>
                  <strong>{log.actor}</strong>
                  <p>
                    {log.action} · {log.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}