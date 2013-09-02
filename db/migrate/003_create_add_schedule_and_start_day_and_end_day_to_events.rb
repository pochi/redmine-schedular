class CreateAddScheduleAndStartDayAndEndDayToEvents < ActiveRecord::Migration
  def change
    add_column :events, :schedule_id, :integer
    rename_column :events, :date, :start_date
    add_column :events, :end_date, :date
  end
end
