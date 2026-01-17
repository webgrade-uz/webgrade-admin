import { Settings as SettingsIcon, User, Shield, Database } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sozlamalar</h2>
        <p className="text-slate-600">Tizim sozlamalarini boshqaring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Profil sozlamalari</h3>
          </div>
          <p className="text-slate-600 mb-4">Admin profil ma'lumotlarini yangilang</p>
          <Button>Profilni tahrirlash</Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold">Xavfsizlik</h3>
          </div>
          <p className="text-slate-600 mb-4">Parol va xavfsizlik sozlamalari</p>
          <Button variant="outline">Parolni o'zgartirish</Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Ma'lumotlar bazasi</h3>
          </div>
          <p className="text-slate-600 mb-4">Ma'lumotlar bazasi sozlamalari</p>
          <Button variant="outline">Backup yaratish</Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold">Umumiy sozlamalar</h3>
          </div>
          <p className="text-slate-600 mb-4">Tizim umumiy sozlamalari</p>
          <Button variant="outline">Sozlamalarni ko'rish</Button>
        </Card>
      </div>
    </div>
  );
}
