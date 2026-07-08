import React, { useEffect, useState } from 'react';
import { testService } from '../../services/test.service';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { School, Plus, Trash2, Edit2, Users, Calendar, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export const ManageBatches = () => {
  const { user: activeUser } = useAuth();
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [batchName, setBatchName] = useState('');

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const data = await testService.getBatches();
      setBatches(data);
    } catch (e) {
      toast.error('Failed to load batches list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const openCreateModal = () => {
    setEditingBatch(null);
    setBatchName('');
    setIsModalOpen(true);
  };

  const openEditModal = (batch) => {
    setEditingBatch(batch);
    setBatchName(batch.name);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batchName.trim()) {
      toast.error('Batch name is required.');
      return;
    }

    try {
      if (editingBatch) {
        await testService.updateBatch(editingBatch._id, { name: batchName.trim() });
        toast.success('Batch updated successfully.');
      } else {
        await testService.createBatch({ name: batchName.trim() });
        toast.success('Batch created successfully.');
      }
      setIsModalOpen(false);
      fetchBatches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save batch.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this batch? All assigned students will be unlinked.')) {
      return;
    }

    try {
      await testService.deleteBatch(id);
      toast.success('Batch deleted successfully.');
      fetchBatches();
    } catch (err) {
      toast.error('Failed to delete batch.');
    }
  };

  const handleExportBatch = async (batchId, batchName) => {
    const loadId = toast.loading(`Generating results Excel sheet for ${batchName}...`);
    try {
      const blob = await testService.exportBatch(batchId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `batch_results_${batchName.replace(/\s+/g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Excel results generated successfully!', { id: loadId });
    } catch (e) {
      toast.error('Failed to export batch results.', { id: loadId });
    }
  };

  const isAdmin = activeUser?.role === 'admin';

  if (isLoading) {
    return <Loader size="lg" className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-8 text-on-background">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-background">Manage Batches</h1>
          <p className="text-xs md:text-sm text-on-surface-variant">
            Group student candidates into batches to restrict exam availability.
          </p>
        </div>
        {isAdmin && (
          <Button 
            onClick={openCreateModal} 
            variant="gradient" 
            size="sm" 
            className="flex items-center gap-2 h-10"
          >
            <Plus className="w-5 h-5" /> Add Batch
          </Button>
        )}
      </div>

      {batches.length === 0 ? (
        <Card variant="glass" className="p-8 text-center max-w-md mx-auto space-y-4">
          <School className="w-12 h-12 text-on-surface-variant/60 mx-auto" />
          <h3 className="text-lg font-bold text-on-surface">No Batches Defined Yet</h3>
          <p className="text-xs text-on-surface-variant">
            Create batches to organize students and target specific test deliveries.
          </p>
          {isAdmin && (
            <Button onClick={openCreateModal} variant="outline" size="sm">
              Create First Batch
            </Button>
          )}
        </Card>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <Card key={batch._id} variant="glass" className="flex flex-col justify-between p-6">
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-semibold">
                    <School className="w-3.5 h-3.5" /> Batch Cohort
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {batch.students?.length || 0} Students
                  </span>
                </div>
                <h3 className="font-h4 text-lg font-bold text-on-surface truncate mb-1">{batch.name}</h3>

                {/* Attribution Info */}
                <div className="mt-4 pt-4 border-t border-outline-variant/20 space-y-1.5 text-[10px] text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Created By:</span>
                    <span className="text-on-surface font-medium">{batch.createdBy?.name || 'Platform'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Modified By:</span>
                    <span className="text-on-surface font-medium">{batch.lastModifiedBy?.name || 'Platform'}</span>
                  </div>
                </div>

                {/* Students list capsule */}
                <div className="mt-4 bg-surface-container/40 border border-outline-variant/20 rounded-xl p-3 max-h-32 overflow-y-auto">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/60 mb-1.5">Roster</p>
                  {batch.students && batch.students.length > 0 ? (
                    <ul className="space-y-1 text-xs">
                      {batch.students.map((s) => (
                        <li key={s._id} className="text-on-surface-variant truncate">
                          • {s.name} <span className="text-[10px] text-on-surface-variant/70">({s.email})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No students assigned yet.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-outline-variant/20">
                <Button 
                  onClick={() => handleExportBatch(batch._id, batch.name)}
                  variant="outline" 
                  size="sm" 
                  fullWidth
                  className="flex items-center justify-center gap-1.5 h-10 hover:bg-primary/5 text-primary border-primary/20 cursor-pointer text-xs font-semibold"
                >
                  <Users className="w-4 h-4" /> Export Results to Excel
                </Button>
              </div>

              {isAdmin && (
                <div className="flex gap-4 pt-4 mt-4 border-t border-slate-800">
                  <Button 
                    onClick={() => openEditModal(batch)} 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-slate-700 hover:bg-slate-800 text-slate-200"
                  >
                    <Edit2 className="w-4 h-4 mr-1.5" /> Edit
                  </Button>
                  <Button 
                    onClick={() => handleDelete(batch._id)} 
                    variant="danger" 
                    size="sm" 
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </section>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingBatch ? 'Modify Batch details' : 'Create New Batch'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-5 text-on-surface">
            <Input 
              label="Batch Name"
              type="text"
              required
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g. Batch A, Morning Section, CET 2026"
            />
            <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
              <Button type="button" variant="outline" fullWidth onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" fullWidth>{editingBatch ? 'Save Changes' : 'Create Batch'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManageBatches;
