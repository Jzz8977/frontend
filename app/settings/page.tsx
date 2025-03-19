"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { systemConfigAPI } from '@/lib/api';

// 表单验证模式
const profileFormSchema = z.object({
  siteName: z.string().min(2, '站点名称至少需要2个字符'),
  siteDescription: z.string(),
  logoUrl: z.string().url('请输入有效的URL').optional().or(z.literal('')),
  contactEmail: z.string().email('请输入有效的邮箱地址'),
  contactPhone: z.string(),
  icp: z.string(),
});

const securityFormSchema = z.object({
  jwtSecret: z.string().min(16, 'JWT密钥至少需要16个字符'),
  jwtExpiration: z.string(),
  passwordMinLength: z.coerce.number().min(6, '密码长度至少为6位'),
  maxLoginAttempts: z.coerce.number().min(1, '最大尝试次数至少为1次'),
  lockoutTime: z.coerce.number().min(1, '锁定时间至少为1分钟'),
});

const wechatFormSchema = z.object({
  wechatAppId: z.string(),
  wechatAppSecret: z.string(),
  wechatToken: z.string().optional().or(z.literal('')),
  wechatEncodingAESKey: z.string().optional().or(z.literal('')),
  wechatPayMchId: z.string().optional().or(z.literal('')),
  wechatPayKey: z.string().optional().or(z.literal('')),
});

// 类型定义
type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;
type WechatFormValues = z.infer<typeof wechatFormSchema>;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [loadingWechat, setLoadingWechat] = useState(false);
  
  // 个人资料表单
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      siteName: '',
      siteDescription: '',
      logoUrl: '',
      contactEmail: '',
      contactPhone: '',
      icp: '',
    },
  });
  
  // 安全设置表单
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      jwtSecret: '',
      jwtExpiration: '24h',
      passwordMinLength: 8,
      maxLoginAttempts: 5,
      lockoutTime: 30,
    },
  });
  
  // 微信设置表单
  const wechatForm = useForm<WechatFormValues>({
    resolver: zodResolver(wechatFormSchema),
    defaultValues: {
      wechatAppId: '',
      wechatAppSecret: '',
      wechatToken: '',
      wechatEncodingAESKey: '',
      wechatPayMchId: '',
      wechatPayKey: '',
    },
  });
  
  // 加载配置
  const loadAllConfigs = async () => {
    try {
      // 加载个人资料配置
      const profileResponse = await systemConfigAPI.getSystemConfigs('profile');
      const profileConfigs = profileResponse.data.data;
      
      // 转换为表单格式
      const profileData: any = {};
      profileConfigs.forEach((config: any) => {
        profileData[config.key.replace('profile.', '')] = config.value;
      });
      
      profileForm.reset({
        siteName: profileData.siteName || '',
        siteDescription: profileData.siteDescription || '',
        logoUrl: profileData.logoUrl || '',
        contactEmail: profileData.contactEmail || '',
        contactPhone: profileData.contactPhone || '',
        icp: profileData.icp || '',
      });
      
      // 加载安全配置
      const securityResponse = await systemConfigAPI.getSystemConfigs('security');
      const securityConfigs = securityResponse.data.data;
      
      // 转换为表单格式
      const securityData: any = {};
      securityConfigs.forEach((config: any) => {
        securityData[config.key.replace('security.', '')] = config.value;
      });
      
      securityForm.reset({
        jwtSecret: securityData.jwtSecret || '',
        jwtExpiration: securityData.jwtExpiration || '24h',
        passwordMinLength: parseInt(securityData.passwordMinLength || '8'),
        maxLoginAttempts: parseInt(securityData.maxLoginAttempts || '5'),
        lockoutTime: parseInt(securityData.lockoutTime || '30'),
      });
      
      // 加载微信配置
      const wechatResponse = await systemConfigAPI.getSystemConfigs('wechat');
      const wechatConfigs = wechatResponse.data.data;
      
      // 转换为表单格式
      const wechatData: any = {};
      wechatConfigs.forEach((config: any) => {
        wechatData[config.key.replace('wechat.', '')] = config.value;
      });
      
      wechatForm.reset({
        wechatAppId: wechatData.appId || '',
        wechatAppSecret: wechatData.appSecret || '',
        wechatToken: wechatData.token || '',
        wechatEncodingAESKey: wechatData.encodingAESKey || '',
        wechatPayMchId: wechatData.payMchId || '',
        wechatPayKey: wechatData.payKey || '',
      });
      
    } catch (error) {
      console.error('加载配置失败:', error);
      toast.error('无法加载系统配置');
    }
  };
  
  // 初始加载
  useEffect(() => {
    loadAllConfigs();
  }, []);
  
  // 保存个人资料
  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      setLoadingProfile(true);
      
      // 转换为系统配置格式
      const configs = [
        { key: 'profile.siteName', value: data.siteName },
        { key: 'profile.siteDescription', value: data.siteDescription },
        { key: 'profile.logoUrl', value: data.logoUrl },
        { key: 'profile.contactEmail', value: data.contactEmail },
        { key: 'profile.contactPhone', value: data.contactPhone },
        { key: 'profile.icp', value: data.icp },
      ];
      
      await systemConfigAPI.batchUpdateSystemConfig(configs);
      toast.success('站点配置已更新');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('更新站点配置时出错');
    } finally {
      setLoadingProfile(false);
    }
  };
  
  // 保存安全设置
  const onSecuritySubmit = async (data: SecurityFormValues) => {
    try {
      setLoadingSecurity(true);
      
      // 转换为系统配置格式
      const configs = [
        { key: 'security.jwtSecret', value: data.jwtSecret },
        { key: 'security.jwtExpiration', value: data.jwtExpiration },
        { key: 'security.passwordMinLength', value: data.passwordMinLength.toString() },
        { key: 'security.maxLoginAttempts', value: data.maxLoginAttempts.toString() },
        { key: 'security.lockoutTime', value: data.lockoutTime.toString() },
      ];
      
      await systemConfigAPI.batchUpdateSystemConfig(configs);
      toast.success('安全配置已更新');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('更新安全配置时出错');
    } finally {
      setLoadingSecurity(false);
    }
  };
  
  // 保存微信设置
  const onWechatSubmit = async (data: WechatFormValues) => {
    try {
      setLoadingWechat(true);
      
      // 转换为系统配置格式
      const configs = [
        { key: 'wechat.appId', value: data.wechatAppId },
        { key: 'wechat.appSecret', value: data.wechatAppSecret },
        { key: 'wechat.token', value: data.wechatToken },
        { key: 'wechat.encodingAESKey', value: data.wechatEncodingAESKey },
        { key: 'wechat.payMchId', value: data.wechatPayMchId },
        { key: 'wechat.payKey', value: data.wechatPayKey },
      ];
      
      await systemConfigAPI.batchUpdateSystemConfig(configs);
      toast.success('微信配置已更新');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('更新微信配置时出错');
    } finally {
      setLoadingWechat(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">高级设置</h1>
        <p className="text-muted-foreground">管理系统的高级配置和参数</p>
      </div>
      
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">站点信息</TabsTrigger>
          <TabsTrigger value="security">安全设置</TabsTrigger>
          <TabsTrigger value="wechat">微信设置</TabsTrigger>
        </TabsList>
        
        {/* 站点信息 */}
        <TabsContent value="profile" className="space-y-4">
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>站点信息</CardTitle>
                  <CardDescription>
                    设置网站基本信息，这些信息可能会在界面上显示
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>站点名称</FormLabel>
                        <FormControl>
                          <Input placeholder="输入站点名称" {...field} />
                        </FormControl>
                        <FormDescription>显示在浏览器标题和登录页面</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="siteDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>站点描述</FormLabel>
                        <FormControl>
                          <Textarea placeholder="输入站点描述" {...field} />
                        </FormControl>
                        <FormDescription>站点的简短描述</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="输入Logo的URL地址" {...field} />
                        </FormControl>
                        <FormDescription>站点Logo的链接地址</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>联系邮箱</FormLabel>
                          <FormControl>
                            <Input placeholder="admin@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>联系电话</FormLabel>
                          <FormControl>
                            <Input placeholder="输入联系电话" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={profileForm.control}
                    name="icp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ICP备案号</FormLabel>
                        <FormControl>
                          <Input placeholder="输入ICP备案号" {...field} />
                        </FormControl>
                        <FormDescription>网站的ICP备案信息</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={loadAllConfigs}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    重置
                  </Button>
                  <Button type="submit" disabled={loadingProfile}>
                    {loadingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        保存设置
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>
        
        {/* 安全设置 */}
        <TabsContent value="security" className="space-y-4">
          <Form {...securityForm}>
            <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>安全设置</CardTitle>
                  <CardDescription>
                    设置系统的安全参数和策略
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={securityForm.control}
                    name="jwtSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>JWT密钥</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="输入JWT密钥" {...field} />
                        </FormControl>
                        <FormDescription>用于签名JWT令牌的密钥</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={securityForm.control}
                    name="jwtExpiration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>JWT过期时间</FormLabel>
                        <FormControl>
                          <Input placeholder="如: 24h, 7d" {...field} />
                        </FormControl>
                        <FormDescription>JWT令牌的有效期</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={securityForm.control}
                      name="passwordMinLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>密码最小长度</FormLabel>
                          <FormControl>
                            <Input type="number" min={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="maxLoginAttempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>最大登录尝试次数</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="lockoutTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>账户锁定时间 (分钟)</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={loadAllConfigs}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    重置
                  </Button>
                  <Button type="submit" disabled={loadingSecurity}>
                    {loadingSecurity ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        保存设置
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>
        
        {/* 微信设置 */}
        <TabsContent value="wechat" className="space-y-4">
          <Form {...wechatForm}>
            <form onSubmit={wechatForm.handleSubmit(onWechatSubmit)} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>微信设置</CardTitle>
                  <CardDescription>
                    配置微信小程序和公众号的相关参数
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={wechatForm.control}
                      name="wechatAppId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AppID</FormLabel>
                          <FormControl>
                            <Input placeholder="微信AppID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={wechatForm.control}
                      name="wechatAppSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AppSecret</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="微信AppSecret" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={wechatForm.control}
                      name="wechatToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token (可选)</FormLabel>
                          <FormControl>
                            <Input placeholder="用于消息加解密" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={wechatForm.control}
                      name="wechatEncodingAESKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EncodingAESKey (可选)</FormLabel>
                          <FormControl>
                            <Input placeholder="消息加解密密钥" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={wechatForm.control}
                      name="wechatPayMchId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>微信支付商户号 (可选)</FormLabel>
                          <FormControl>
                            <Input placeholder="商户号" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={wechatForm.control}
                      name="wechatPayKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>微信支付密钥 (可选)</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="API密钥" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={loadAllConfigs}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    重置
                  </Button>
                  <Button type="submit" disabled={loadingWechat}>
                    {loadingWechat ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        保存设置
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
} 