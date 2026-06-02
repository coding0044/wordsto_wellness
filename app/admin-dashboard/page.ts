import { redirect } from 'next/navigation';

export default function AdminDashboardRootPage() {
  redirect('/admin-dashboard/overview');
}
