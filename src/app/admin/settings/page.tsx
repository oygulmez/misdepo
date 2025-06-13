'use client'

import { useState, useEffect } from 'react'
import { settingsApi } from '@/lib/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Settings,
  Store,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  CreditCard,
  Truck,
  Bell,
  Palette,
  Database,
  Download,
  Upload,
  Save,
  RefreshCw,
  CheckCircle,
  Trash
} from 'lucide-react'

export default function AdminSettings() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [settings, setSettings] = useState<{[key: string]: any}>({
    // Genel Ayarlar
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    website: '',
    
    // E-ticaret Ayarları
    currency: 'TRY',
    minOrderAmount: 100,
    freeShippingLimit: 500,
    taxRate: 18,
    
    // Bildirim Ayarları
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    stockAlerts: true,
    
    // Güvenlik
    twoFactorAuth: false,
    sessionTimeout: 60,
  })

  // Ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      console.log('🏁 SAYFA YÜKLENİYOR - loadSettings başlatıldı')
      try {
        // Önce default settings'leri initialize et
        console.log('1️⃣ Default settings initialize ediliyor...')
        await settingsApi.initializeDefaults()
        console.log('✅ Default settings tamamlandı')
        
        // Sonra tüm ayarları yükle
        console.log('2️⃣ Database\'den ayarlar yükleniyor...')
        const allSettings = await settingsApi.getAll()
        console.log('🔍 Database den gelen raw ayarlar:', allSettings)
        console.log('📊 Toplam ayar sayısı:', allSettings.length)
        
        // Settings array'ini object'e çevir - JSONB değerleri zaten doğru tipte
        const settingsObject: any = {}
        allSettings.forEach(setting => {
          settingsObject[setting.key] = setting.value
          console.log(`🔧 ${setting.key}: ${JSON.stringify(setting.value)} (${typeof setting.value})`)
        })
        
        console.log('📋 Parse edilmiş ayarlar objekti:', settingsObject)
        
        // State'i TAM OLARAK değiştir (merge etme)
        console.log('3️⃣ State güncelleniyor...')
        console.log('🗂️ Eski state:', settings)
        
        setSettings(settingsObject) // Direkt değiştir, merge etme
        
        console.log('4️⃣ State güncellendi!')
        console.log('✅ SAYFA YÜKLEMESİ TAMAMLANDI!')
      } catch (error) {
        console.error('❌ Ayarlar yüklenirken hata:', error)
        toast.error('Ayarlar yüklenirken bir hata oluştu!')
      } finally {
        setInitialLoading(false)
        console.log('🏁 Loading state kapatıldı')
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    console.log('🔄 Kaydet butonuna basıldı!')
    console.log('📝 Kaydedilecek ayarlar:', settings)
    
    setLoading(true)
    try {
      // Her ayar için ayrı ayrı kaydet
      const savePromises = Object.entries(settings).map(([key, value]) => {
        console.log(`💾 Kaydediliyor: ${key} = ${JSON.stringify(value)}`)
        return settingsApi.updateByKey(key, value)
      })
      
      console.log('⏳ Tüm kayıt işlemleri başlatıldı...')
      const results = await Promise.all(savePromises)
      console.log('📊 Kayıt sonuçları:', results)
      
      // Kaydettikten sonra tekrar yükle
      console.log('🔄 Ayarları yeniden yüklüyor...')
      const updatedSettings = await settingsApi.getAll()
      
      // Settings array'ini object'e çevir - JSONB değerleri zaten doğru tipte
      const settingsObject: any = {}
      updatedSettings.forEach(setting => {
        settingsObject[setting.key] = setting.value
        console.log(`🔄 Yeniden yüklenen: ${setting.key} = ${JSON.stringify(setting.value)}`)
      })
      
      // State'i güncelle
      setSettings(settingsObject) // Tamamen değiştir, merge etme
      
      console.log('✅ Tüm ayarlar başarıyla kaydedildi ve yenilendi!')
      toast.success('✅ Ayarlar başarıyla kaydedildi!', {
        description: `${Object.keys(settings).length} ayar kaydedildi ve sistem güncellendi.`,
        duration: 3000,
      })
    } catch (error) {
      console.error('❌ Ayarlar kaydedilirken hata:', error)
      toast.error('❌ Ayarlar kaydedilirken bir hata oluştu!', {
        description: `Hata: ${error}`,
        duration: 5000,
      })
    } finally {
      setLoading(false)
      console.log('🏁 Kayıt işlemi tamamlandı')
    }
  }

  const handleExportData = async () => {
    try {
      // Tüm ayarları JSON olarak indir
      const dataStr = JSON.stringify(settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ayarlar-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      
      toast.success('✅ Ayarlar dışa aktarıldı!')
    } catch (error) {
      toast.error('❌ Dışa aktarma başarısız!')
    }
  }

  const testDatabase = async () => {
    try {
      console.log('🔍 Database bağlantısı test ediliyor...')
      toast('Database bağlantısı test ediliyor...')
      
      const settings = await settingsApi.getAll()
      console.log('✅ Database bağlantısı başarılı! Ayarlar:', settings)
      toast.success(`✅ Database bağlantısı başarılı! ${settings.length} ayar bulundu.`)
    } catch (error) {
      console.error('❌ Database bağlantı hatası:', error)
      toast.error(`❌ Database bağlantı hatası: ${error}`)
    }
  }

  const clearAllSettings = async () => {
    if (!confirm('Tüm ayarları silmek istediğinizden emin misiniz?')) return
    
    try {
      console.log('🧹 Tüm ayarlar siliniyor...')
      toast('Tüm ayarlar siliniyor...')
      
      await settingsApi.clearAll()
      
      // State'i default'a çevir
      setSettings({
        siteName: '',
        siteDescription: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        website: '',
        currency: 'TRY',
        minOrderAmount: 100,
        freeShippingLimit: 500,
        taxRate: 18,
        emailNotifications: true,
        smsNotifications: false,
        orderNotifications: true,
        stockAlerts: true,
        twoFactorAuth: false,
        sessionTimeout: 60,
      })
      
      console.log('✅ Tüm ayarlar silindi!')
      toast.success('✅ Tüm ayarlar silindi! Sayfa yenilenecek...')
      
      // 2 saniye sonra sayfayı yenile
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      console.error('❌ Ayarlar silinirken hata:', error)
      toast.error(`❌ Hata: ${error}`)
    }
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const importedSettings = JSON.parse(e.target?.result as string)
            setSettings(prev => ({ ...prev, ...importedSettings }))
            toast.success('✅ Ayarlar içe aktarıldı! Kaydetmeyi unutmayın.')
          } catch (error) {
            toast.error('❌ Geçersiz dosya formatı!')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const updateSetting = (key: string, value: any) => {
    console.log(`🔄 Setting değiştirildi: ${key} = ${JSON.stringify(value)}`)
    console.log(`📋 Eski değer:`, settings[key])
    console.log(`📋 Yeni değer:`, value)
    console.log(`📋 Değer tipi:`, typeof value)
    
    const oldSettings = { ...settings }
    const newSettings = { ...settings, [key]: value }
    
    setSettings(newSettings)
    
    console.log(`📊 State değişimi:`)
    console.log(`   Eski:`, oldSettings[key])
    console.log(`   Yeni:`, newSettings[key])
    
    // Visual feedback için kısa bir toast
    toast(`Setting değiştirildi: ${key} = ${JSON.stringify(value)}`, {
      duration: 2000,
    })
  }

  // DEBUG: Tek bir setting'i test et
  const testSingleSetting = async () => {
    try {
      console.log('🧪 Tek setting test ediliyor...')
      
      // Test değeri kaydet
      const testKey = 'testSetting'
      const testValue = 'TEST_' + Date.now()
      
      console.log(`💾 Test kaydediliyor: ${testKey} = ${testValue}`)
      await settingsApi.updateByKey(testKey, testValue)
      
      // Hemen geri oku
      console.log('🔍 Test değeri okunuyor...')
      const result = await settingsApi.getByKey(testKey)
      console.log('📋 Okunan değer:', result)
      
      if (result.value === testValue) {
        toast.success(`✅ Test başarılı! Değer: ${result.value}`)
      } else {
        toast.error(`❌ Test başarısız! Beklenen: ${testValue}, Bulunan: ${result.value}`)
      }
      
    } catch (error) {
      console.error('❌ Test hatası:', error)
      toast.error(`❌ Test hatası: ${error}`)
    }
  }

  // DEBUG: Mevcut state'i logla
  const logCurrentState = () => {
    console.log('🔍 Mevcut state:', settings)
    toast(`State logged to console. Check browser dev tools.`)
  }

  // DEBUG: Database'deki tüm ayarları logla
  const logDatabaseSettings = async () => {
    try {
      const dbSettings = await settingsApi.getAll()
      console.log('🔍 Database\'deki tüm ayarlar:', dbSettings)
      
      const settingsMap: any = {}
      dbSettings.forEach(setting => {
        settingsMap[setting.key] = {
          value: setting.value,
          type: typeof setting.value,
          updated_at: setting.updated_at
        }
      })
      console.table(settingsMap)
      
      toast(`Database ayarları console'a yazıldı. ${dbSettings.length} ayar bulundu.`)
    } catch (error) {
      console.error('❌ Database okuma hatası:', error)
      toast.error(`❌ Hata: ${error}`)
    }
  }

  if (initialLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        
        {/* Toolbar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Sistem Ayarları</h3>
                <p className="text-sm text-muted-foreground">Site ve sistem yapılandırması</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* Debug Butonları */}
                <div className="flex gap-1 border rounded p-1">
                  <Button variant="ghost" size="sm" onClick={testSingleSetting}>
                    🧪 Test Setting
                  </Button>
                  <Button variant="ghost" size="sm" onClick={logCurrentState}>
                    📋 Log State
                  </Button>
                  <Button variant="ghost" size="sm" onClick={logDatabaseSettings}>
                    🗄️ Log DB
                  </Button>
                </div>
                
                {/* Ana Butonlar */}
                <Button variant="outline" onClick={testDatabase}>
                  <Database className="h-4 w-4 mr-2" />
                  Test DB
                </Button>
                <Button variant="outline" onClick={clearAllSettings}>
                  <Trash className="h-4 w-4 mr-2" />
                  Tüm Ayarları Sil
                </Button>
                <Button variant="outline" onClick={handleImportData}>
                  <Upload className="h-4 w-4 mr-2" />
                  İçe Aktar
                </Button>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Dışa Aktar
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="general">Genel</TabsTrigger>
            <TabsTrigger value="ecommerce">E-ticaret</TabsTrigger>
            <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
            <TabsTrigger value="security">Güvenlik</TabsTrigger>
            <TabsTrigger value="data">Veri</TabsTrigger>
          </TabsList>

          {/* Genel Ayarlar */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  Site Bilgileri
                </CardTitle>
                <CardDescription>
                  Web sitenizin temel bilgilerini düzenleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Adı</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => updateSetting('siteName', e.target.value)}
                      placeholder="Temizlik & Ambalaj"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      value={settings.website}
                      onChange={(e) => updateSetting('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Açıklaması</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => updateSetting('siteDescription', e.target.value)}
                    rows={3}
                    placeholder="Kaliteli temizlik ürünleri ve ambalaj çözümleri"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  İletişim Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">E-posta</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => updateSetting('contactEmail', e.target.value)}
                      placeholder="info@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Telefon</Label>
                    <Input
                      id="contactPhone"
                      value={settings.contactPhone}
                      onChange={(e) => updateSetting('contactPhone', e.target.value)}
                      placeholder="+90 (212) 123 45 67"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Textarea
                    id="address"
                    value={settings.address}
                    onChange={(e) => updateSetting('address', e.target.value)}
                    rows={2}
                    placeholder="İstanbul, Türkiye"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* E-ticaret Ayarları */}
          <TabsContent value="ecommerce" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Ödeme Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Para Birimi</Label>
                    <Input
                      id="currency"
                      value={settings.currency}
                      onChange={(e) => updateSetting('currency', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">KDV Oranı (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => updateSetting('taxRate', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Kargo Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minOrderAmount">Minimum Sipariş Tutarı (₺)</Label>
                    <Input
                      id="minOrderAmount"
                      type="number"
                      value={settings.minOrderAmount}
                      onChange={(e) => updateSetting('minOrderAmount', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="freeShippingLimit">Ücretsiz Kargo Limiti (₺)</Label>
                    <Input
                      id="freeShippingLimit"
                      type="number"
                      value={settings.freeShippingLimit}
                      onChange={(e) => updateSetting('freeShippingLimit', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bildirim Ayarları */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Bildirim Tercihleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>E-posta Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">
                      Önemli güncellemeler e-posta ile gönderilsin
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked: boolean) => updateSetting('emailNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">
                      Acil durumlar SMS ile bildirilsin
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked: boolean) => updateSetting('smsNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sipariş Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">
                      Yeni siparişler anında bildirilsin
                    </p>
                  </div>
                  <Switch
                    checked={settings.orderNotifications}
                    onCheckedChange={(checked: boolean) => updateSetting('orderNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Stok Uyarıları</Label>
                    <p className="text-sm text-muted-foreground">
                      Düşük stok durumunda uyarı gönderilsin
                    </p>
                  </div>
                  <Switch
                    checked={settings.stockAlerts}
                    onCheckedChange={(checked: boolean) => updateSetting('stockAlerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Güvenlik Ayarları */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Güvenlik Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>İki Faktörlü Kimlik Doğrulama</Label>
                    <p className="text-sm text-muted-foreground">
                      Ekstra güvenlik katmanı ekleyin
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked: boolean) => updateSetting('twoFactorAuth', checked)}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Oturum Zaman Aşımı (dakika)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value) || 60)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Veri Yönetimi */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Veri Yönetimi
                </CardTitle>
                <CardDescription>
                  Ayarlarınızı dışa aktarın veya içe aktarın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Ayarları Dışa Aktar
                  </Button>
                  <Button variant="outline" onClick={handleImportData}>
                    <Upload className="h-4 w-4 mr-2" />
                    Ayarları İçe Aktar
                  </Button>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Otomatik Kayıt Sistemi</p>
                      <p className="text-sm text-muted-foreground">
                        Ayarlarınız veritabanında güvenli şekilde saklanır. Her değişiklik anında sisteme yansır.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 