class CreateSchedularSettings < ActiveRecord::Migration
  def change
    create_table :scheduler_settings do |t|
      t.integer :period, :default => 14
    end
  end
end
