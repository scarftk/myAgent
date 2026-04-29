import { useMemo, useRef, useState } from 'react';

type Agent = {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'done';
  focus: string;
};

type RunStatus = 'idle' | 'running' | 'completed' | 'stopped';

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

type ScenarioProfile = {
  id: (typeof scenarios)[number]['id'];
  name: string;
  summary: string;
  painPoint: string;
  objective: string;
  keySteps: string[];
  successSignals: string[];
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

const scenarioProfiles: ScenarioProfile[] = [
  {
    id: 'campaign',
    name: '投放优化',
    summary: '多 Agent 协同完成活动诊断、文案优化、预算调整和复盘。',
    painPoint: '投放数据分散、策略调整慢、活动复盘依赖人工，容易错过最佳调整窗口。',
    objective: '围绕转化率和投产比，快速找出异常来源并给出优化动作。',
    keySteps: ['识别低效素材', '分析预算分配', '执行文案和出价调整', '复核效果并沉淀结论'],
    successSignals: ['转化率提升', 'CPC 下降', '预算使用更均衡'],
  },
  {
    id: 'crm',
    name: '私域转化',
    summary: '围绕线索分层、自动触达、跟进提醒和流失预警形成闭环。',
    painPoint: '线索跟进链路长，人工触达不稳定，容易出现漏跟、错跟和转化损耗。',
    objective: '对线索做分层管理并自动推进触达节奏，提升成交率。',
    keySteps: ['线索分层', '触达策略编排', '自动提醒跟进', '输出流失预警'],
    successSignals: ['触达及时率提升', '流失率下降', '跟进动作可追踪'],
  },
  {
    id: 'ops',
    name: '运营排障',
    summary: '多 Agent 分析告警、定位异常、生成处置建议并同步执行结果。',
    painPoint: '异常处理依赖人盯人，定位耗时长，跨团队协作容易出现信息断层。',
    objective: '在告警发生后快速定位、分派处置并完成复核闭环。',
    keySteps: ['告警聚合', '根因分析', '处置编排', '复核回收'],
    successSignals: ['MTTR 缩短', '误报减少', '处置记录留痕'],
  },
];

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
  const [runStatus, setRunStatus] = useState<RunStatus>('idle');
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);

  const runTokenRef = useRef(0);

  const selectedScenario = useMemo(() => scenarios.find((item) => item.id === scenario) ?? scenarios[0], [scenario]);
  const selectedProfile = useMemo(
    () => scenarioProfiles.find((item) => item.id === scenario) ?? scenarioProfiles[0],
    [scenario],
  );

  const metrics = useMemo(
    () => [
      { label: '自动化覆盖率', value: '86%', delta: '+18%' },
      { label: '平均响应时长', value: '42s', delta: '-31%' },
      { label: '执行成功率', value: '97.4%', delta: '+6.8%' },
      { label: '异常拦截数', value: '28', delta: '+11' },
    ],
    [],
  );

  const resetBoard = () => {
    runTokenRef.current += 1;
    setRunStatus('idle');
    setCurrentStep('');
    setProgress(0);
    setAgents(baseAgents);
    setLogs(buildScenarioLogs(selectedScenario.name));
  };

  const stopRun = () => {
    runTokenRef.current += 1;
    setRunStatus('stopped');
    setCurrentStep('流程已手动终止，已保留当前日志。');
    setAgents((current) => current.map((agent) => (agent.status === 'working' ? { ...agent, status: 'idle' } : agent)));
    setLogs((current) => [
      ...current,
      {
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        actor: '系统',
        action: '人工终止',
        detail: '当前流程被中止，等待重新编排。',
      },
    ]);
  };

  const runScenario = async () => {
    const token = runTokenRef.current + 1;
    runTokenRef.current = token;
    setRunStatus('running');
    setCurrentStep('正在生成协同计划');
    setProgress(5);
    setAgents((current) => current.map((agent) => ({ ...agent, status: 'working' })));
    setLogs(buildScenarioLogs(selectedScenario.name));

    const phases = [
      { agentId: 'planner', label: '策略规划 Agent', detail: '已完成任务拆解与优先级排序。' },
      { agentId: 'analyst', label: '数据分析 Agent', detail: '已完成指标归因与异常识别。' },
      { agentId: 'operator', label: '执行运营 Agent', detail: '已完成执行动作编排与下发。' },
      { agentId: 'reviewer', label: '审校风控 Agent', detail: '已完成复核、提示与结果收束。' },
    ];

    for (const [index, phase] of phases.entries()) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      if (runTokenRef.current !== token) {
        return;
      }

      setAgents((current) =>
        current.map((agent) => (agent.id === phase.agentId ? { ...agent, status: 'done' } : agent)),
      );
      setCurrentStep(phase.label);
      setProgress(Math.round(((index + 1) / phases.length) * 100));
      setLogs((current) => [
        ...current,
        {
          time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
          actor: phase.label,
          action: '阶段完成',
          detail: phase.detail,
        },
      ]);
    }

    if (runTokenRef.current === token) {
      setRunStatus('completed');
      setCurrentStep('全部阶段已完成，结果已汇总。');
      setLogs((current) => [
        ...current,
        {
          time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
          actor: '系统',
          action: '流程完成',
          detail: '多 Agent 协同闭环已结束，等待下一轮执行。',
        },
      ]);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Multi-Agent Ops</p>
          <h1>多 Agent 协同运营自动化系统</h1>
          <p className="sidebar-copy">
            解决运营任务分散、响应慢、复盘难的问题。通过策略、分析、执行和审校四个 Agent 协同，把原本分散的人工流程收敛成一个可追踪的自动化闭环。
          </p>
        </div>

        <div className="scenario-list">
          {scenarios.map((item) => (
            <button
              key={item.id}
              className={`scenario-card ${scenario === item.id ? 'active' : ''}`}
              onClick={() => {
                setScenario(item.id);
                resetBoard();
              }}
            >
              <span>{item.name}</span>
              <small>{item.summary}</small>
            </button>
          ))}
        </div>

        <div className="sidebar-actions">
          <button className="primary-btn" onClick={runScenario} disabled={runStatus === 'running'}>
            {runStatus === 'running' ? '运行中...' : '启动协同编排'}
          </button>
          <button className="secondary-btn" onClick={stopRun} disabled={runStatus !== 'running'}>
            终止流程
          </button>
          <button className="ghost-btn" onClick={resetBoard}>
            重置看板
          </button>
        </div>
      </aside>

      <main className="content">
        <section className="hero-card">
          <div>
            <p className="eyebrow">Workflow Control Center</p>
            <h2>{selectedScenario.name}</h2>
            <p>{selectedScenario.summary}</p>
          </div>
          <div className="hero-status">
            <span className={runStatus === 'running' ? 'pulse live' : 'pulse'} />
            <strong>{runStatus === 'running' ? '多 Agent 正在协同执行' : runStatus === 'completed' ? '流程已完成' : runStatus === 'stopped' ? '流程已终止' : '待命中'}</strong>
            <span>核心逻辑为任务拆解、信号分析、协作执行和审校闭环，不强调长链推理，强调流程协同。</span>
          </div>
        </section>

        <section className="detail-grid">
          <article className="panel detail-panel">
            <div className="panel-head">
              <h3>项目痛点</h3>
              <span>为什么需要多 Agent</span>
            </div>
            <p className="detail-text">{selectedProfile.painPoint}</p>
          </article>

          <article className="panel detail-panel">
            <div className="panel-head">
              <h3>当前目标</h3>
              <span>本轮执行关注点</span>
            </div>
            <p className="detail-text">{selectedProfile.objective}</p>
          </article>
        </section>

        <section className="progress-card panel">
          <div className="panel-head">
            <h3>执行进度</h3>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-caption">
            <strong>{currentStep || '尚未开始'}</strong>
            <span>
              {runStatus === 'running'
                ? '系统正在编排并逐段推进任务。'
                : runStatus === 'completed'
                  ? '所有阶段已完成，日志和状态已收束。'
                  : runStatus === 'stopped'
                    ? '流程已停止，可重新启动或切换场景。'
                    : '点击启动后进入自动化协同流程。'}
            </span>
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

        <section className="panel summary-panel">
          <div className="panel-head">
            <h3>关键步骤</h3>
            <span>场景化输出</span>
          </div>
          <div className="chip-row">
            {selectedProfile.keySteps.map((step) => (
              <span key={step} className="chip">
                {step}
              </span>
            ))}
          </div>
          <div className="chip-row muted-row">
            {selectedProfile.successSignals.map((signal) => (
              <span key={signal} className="chip muted">
                {signal}
              </span>
            ))}
          </div>
        </section>

        <section className="panel logs-panel">
          <div className="panel-head">
            <h3>执行日志</h3>
            <span>{runStatus === 'running' ? '实时可追踪' : '运行记录'}</span>
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