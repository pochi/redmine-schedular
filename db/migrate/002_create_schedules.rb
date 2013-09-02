class CreateSchedules < ActiveRecord::Migration
  def change
    create_table :schedules do |t|
      t.integer :project_id
      t.string :title
      t.integer :licence
    end
  end
end
