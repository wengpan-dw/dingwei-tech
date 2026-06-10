import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Tabs,
  message,
  Typography,
  Space,
  Modal,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

const { Title, Text } = Typography;

interface LoginValues {
  username: string;
  password: string;
}

interface RegisterValues {
  username: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
}

const features = [
  { emoji: '📍', label: 'GPS定位', desc: '实时追踪车辆位置，历史轨迹回放' },
  { emoji: '🔋', label: 'BMS监控', desc: '电池电压/温度/SOC全面监测' },
  { emoji: '🎮', label: '远程控制', desc: '一键断电/重启/锁车远程操控' },
  { emoji: '⬆️', label: 'OTA升级', desc: '固件在线远程升级，持续迭代' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const loginStore = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('login');
  const [loginForm] = Form.useForm<LoginValues>();
  const [registerForm] = Form.useForm<RegisterValues>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [apiUrlInput, setApiUrlInput] = useState('');

  useEffect(() => {
    setApiUrl(localStorage.getItem('api_base_url') || '');
    setApiUrlInput(localStorage.getItem('api_base_url') || '');
  }, []);

  const handleSaveApiUrl = () => {
    const trimmed = apiUrlInput.trim();
    if (trimmed) {
      localStorage.setItem('api_base_url', trimmed);
      setApiUrl(trimmed);
      message.success(`后端地址已设为 ${trimmed}`);
    } else {
      localStorage.removeItem('api_base_url');
      setApiUrl('');
      message.success('已恢复默认地址 (localhost:8000)');
    }
    setSettingsOpen(false);
  };

  const handleResetApiUrl = () => {
    localStorage.removeItem('api_base_url');
    setApiUrl('');
    setApiUrlInput('');
    message.success('已恢复默认地址 (localhost:8000)');
    setSettingsOpen(false);
  };

  const handleLogin = async (values: LoginValues) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login(values.username, values.password);
      loginStore.login(data.access_token, data.refresh_token, data.user);
      message.success('登录成功，欢迎回来！');
      navigate('/', { replace: true });
    } catch (err: any) {
      const detail = err.response?.data?.detail || '用户名或密码错误，请重试';
      message.error(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterValues) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register(values);
      loginStore.login(data.access_token, data.refresh_token, data.user);
      message.success('注册成功，欢迎加入！');
      navigate('/', { replace: true });
    } catch (err: any) {
      const detail = err.response?.data?.detail || '注册失败，请稍后重试';
      message.error(detail);
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Form
          form={loginForm}
          onFinish={handleLogin}
          layout="vertical"
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 44,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1a3a6b, #2a5298)',
                border: 'none',
              }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Form
          form={registerForm}
          onFinish={handleRegister}
          layout="vertical"
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="邮箱"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item name="phone">
            <Input
              prefix={<PhoneOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="手机号（选填）"
            />
          </Form.Item>

          <Form.Item name="company">
            <Input
              prefix={<BankOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="公司名称（选填）"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 44,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1a3a6b, #2a5298)',
                border: 'none',
              }}
            >
              注 册
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* ── Left Side: Branding ── */}
      <div style={styles.leftPanel}>
        <div style={styles.brandingWrapper}>
          <Title style={styles.appTitle}>BMS Track 定位平台</Title>
          <Text style={styles.subtitle}>两轮电动车智能管理SaaS平台</Text>

          <div style={styles.featureList}>
            {features.map((item) => (
              <div key={item.label} style={styles.featureItem}>
                <span style={styles.featureEmoji}>{item.emoji}</span>
                <div>
                  <div style={styles.featureLabel}>{item.label}</div>
                  <div style={styles.featureDesc}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Side: Form Card ── */}
      <div style={styles.rightPanel}>
        <Card
          style={styles.card}
          bodyStyle={{ padding: '40px 36px' }}
          bordered={false}
        >
          <Space direction="vertical" size={4} style={{ textAlign: 'center', width: '100%', marginBottom: 24 }}>
            <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1a3a6b' }}>
              欢迎使用
            </Title>
            <Text type="secondary">登录或注册以开始管理您的设备</Text>
          </Space>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            size="large"
            items={tabItems}
            style={{ marginBottom: -8 }}
            tabBarStyle={{
              fontWeight: 600,
              marginBottom: 28,
            }}
          />
        </Card>

        {/* ── 后端地址设置 ── */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tooltip title="设置后端 API 地址">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => setSettingsOpen(true)}
              style={{ color: 'rgba(255,255,255,0.55)', fontSize: 18 }}
            />
          </Tooltip>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            {apiUrl ? `后端: ${apiUrl}` : '默认 localhost:8000'}
          </Text>
        </div>

        <Text style={styles.footer}>
          © 2026 BMS Track · 两轮电动车智能管理平台
        </Text>
      </div>

      {/* ── 后端地址设置弹窗 ── */}
      <Modal
        title="设置后端 API 地址"
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        footer={[
          <Button key="reset" danger onClick={handleResetApiUrl}>
            恢复默认
          </Button>,
          <Button key="cancel" onClick={() => setSettingsOpen(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveApiUrl}>
            保存
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Text type="secondary">
            输入后端服务的公网地址（含端口号）。设置后无需刷新页面即可生效。
          </Text>
          <Input
            placeholder="例如: https://your-server.com:8000"
            value={apiUrlInput}
            onChange={(e) => setApiUrlInput(e.target.value)}
            onPressEnter={handleSaveApiUrl}
            size="large"
            allowClear
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            留空保存 = 恢复默认 localhost:8000
          </Text>
        </Space>
      </Modal>
    </div>
  );
};

// ── Inline Styles ──
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0b1a3b 0%, #122a5c 25%, #1e4a8a 55%, #5ba0cf 100%)',
    overflow: 'hidden',
  },
  leftPanel: {
    flex: '1 1 50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  brandingWrapper: {
    maxWidth: 460,
  },
  appTitle: {
    color: '#fff',
    fontSize: 38,
    fontWeight: 800,
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 17,
    fontWeight: 400,
  },
  featureList: {
    marginTop: 48,
    display: 'flex',
    flexDirection: 'column',
    gap: 22,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  featureEmoji: {
    fontSize: 32,
    lineHeight: 1,
  },
  featureLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 2,
  },
  featureDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  rightPanel: {
    flex: '1 1 50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(10px)',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 16,
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  footer: {
    marginTop: 20,
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
  },
};

export default LoginPage;
